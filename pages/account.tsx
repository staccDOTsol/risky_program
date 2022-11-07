import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  BellIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  DuplicateIcon,
  ExclamationCircleIcon,
  GiftIcon,
  LinkIcon,
  PencilIcon,
  SwitchHorizontalIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/react/solid'
import { nativeToUi, ZERO_BN } from '@blockworks-foundation/mango-client'
import useMangoStore, { serumProgramId, MNGO_INDEX } from 'stores/useMangoStore'
import AccountOrders from 'components/account_page/AccountOrders'
import AccountHistory from 'components/account_page/AccountHistory'
import AccountsModal from 'components/AccountsModal'
import AccountOverview from 'components/account_page/AccountOverview'
import AccountPerformancePerToken from 'components/account_page/AccountPerformancePerToken'
import AccountNameModal from 'components/AccountNameModal'
import Button, { LinkButton } from 'components/Button'
import EmptyState from 'components/EmptyState'
import Loading from 'components/Loading'
import Swipeable from 'components/mobile/Swipeable'
import Tabs from 'components/Tabs'
import { useViewport } from 'hooks/useViewport'
import { breakpoints } from 'components/TradePageGrid'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'
import CloseAccountModal from 'components/CloseAccountModal'
import { notify } from 'utils/notifications'
import {
  actionsSelector,
  mangoAccountSelector,
  mangoGroupSelector,
} from 'stores/selectors'
import CreateAlertModal from 'components/CreateAlertModal'
import {
  abbreviateAddress,
  // abbreviateAddress,
  copyToClipboard,
} from 'utils'
import DelegateModal from 'components/DelegateModal'
import { Menu, Transition } from '@headlessui/react'
import { useWallet } from '@solana/wallet-adapter-react'
import { handleWalletConnect } from 'components/ConnectWalletButton'
import { MangoAccountLookup } from 'components/account_page/MangoAccountLookup'
import NftProfilePicModal from 'components/NftProfilePicModal'
import SwipeableTabs from 'components/mobile/SwipeableTabs'
import useLocalStorageState from 'hooks/useLocalStorageState'
import dayjs from 'dayjs'
import Link from 'next/link'
import ProfileImage from 'components/ProfileImage'
import Tooltip from 'components/Tooltip'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'common',
        'close-account',
        'delegate',
        'alerts',
        'account-performance',
        'share-modal',
        'profile',
      ])),
      // Will be passed to the page component as props
    },
  }
}

const TABS = ['Overview', 'Orders', 'History', 'Performance']

export default function Account() {
  const { t } = useTranslation(['common', 'close-account', 'delegate'])
  const { width } = useViewport()
  const router = useRouter()
  const { connected, wallet, publicKey } = useWallet()
  const isLoading = useMangoStore((s) => s.selectedMangoAccount.initialLoad)
  const mangoAccount = useMangoStore(mangoAccountSelector)
  const mangoGroup = useMangoStore(mangoGroupSelector)
  const actions = useMangoStore(actionsSelector)
  const setMangoStore = useMangoStore((s) => s.set)
  const [showAccountsModal, setShowAccountsModal] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [showCloseAccountModal, setShowCloseAccountModal] = useState(false)
  const [showAlertsModal, setShowAlertsModal] = useState(false)
  const [showDelegateModal, setShowDelegateModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [resetOnLeave, setResetOnLeave] = useState(false)
  const [mngoAccrued, setMngoAccrued] = useState(ZERO_BN)
  const [viewIndex, setViewIndex] = useState(0)
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [showProfilePicModal, setShowProfilePicModal] = useState(false)
  const [savedLanguage] = useLocalStorageState('language', '')

  const [profileData, setProfileData] = useState<any>(null)
  const [loadProfileDetails, setLoadProfileDetails] = useState(false)

  const connecting = wallet?.adapter?.connecting
  const isMobile = width ? width < breakpoints.sm : false
  const { pubkey } = router.query
  const isDelegatedAccount = publicKey
    ? !mangoAccount?.owner?.equals(publicKey)
    : false

  const handleCloseAlertModal = useCallback(() => {
    setShowAlertsModal(false)
  }, [])

  const handleCloseAccounts = useCallback(() => {
    setShowAccountsModal(false)
  }, [])

  const handleCloseNameModal = useCallback(() => {
    setShowNameModal(false)
  }, [])

  const handleCloseCloseAccountModal = useCallback(() => {
    setShowCloseAccountModal(false)
  }, [])

  const handleCloseDelegateModal = useCallback(() => {
    setShowDelegateModal(false)
  }, [])

  const handleCloseProfilePicModal = useCallback(() => {
    setShowProfilePicModal(false)
  }, [])

  const handleConnect = useCallback(() => {
    if (wallet) {
      handleWalletConnect(wallet)
    }
  }, [wallet])

  useEffect(() => {
    dayjs.locale(savedLanguage == 'zh_tw' ? 'zh-tw' : savedLanguage)
  })

  useEffect(() => {
    async function loadUnownedMangoAccount() {
      try {
        if (!pubkey) {
          return
        }
        const unownedMangoAccountPubkey = new PublicKey(pubkey)
        const mangoClient = useMangoStore.getState().connection.client
        if (mangoGroup) {
          const unOwnedMangoAccount = await mangoClient.getMangoAccount(
            unownedMangoAccountPubkey,
            serumProgramId
          )
          setMangoStore((state) => {
            state.selectedMangoAccount.current = unOwnedMangoAccount
            state.selectedMangoAccount.initialLoad = false
          })
          await actions.fetchTradeHistory()
          await fetchProfileDetails(unOwnedMangoAccount?.owner.toString())
          setResetOnLeave(true)
        }
      } catch (error) {
        console.log('error', error)
        router.push('/account')
      }
    }

    if (pubkey) {
      setMangoStore((state) => {
        state.selectedMangoAccount.initialLoad = true
      })
      loadUnownedMangoAccount()
    }
  }, [pubkey, mangoGroup])

  useEffect(() => {
    const handleRouteChange = () => {
      if (resetOnLeave) {
        setMangoStore((state) => {
          state.selectedMangoAccount.current = null
        })
      }
    }
    router.events.on('routeChangeStart', handleRouteChange)
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [resetOnLeave])

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isCopied])

  const handleCopyAddress = (address) => {
    setIsCopied(true)
    copyToClipboard(address)
  }

  const handleChangeViewIndex = (index) => {
    setViewIndex(index)
  }

  const handleTabChange = (tabName) => {
    setActiveTab(tabName)
    setViewIndex(TABS.findIndex((t) => t === tabName))
  }

  useMemo(() => {
    setMngoAccrued(
      mangoAccount
        ? mangoAccount?.perpAccounts.reduce((acc, perpAcct) => {
            return perpAcct.mngoAccrued.add(acc)
          }, ZERO_BN)
        : ZERO_BN
    )
  }, [mangoAccount])

  useEffect(() => {
    if (connecting) {
      router.push('/account')
    }
  }, [connecting, router])

  const handleRedeemMngo = async () => {
    const mangoClient = useMangoStore.getState().connection.client
    const mngoNodeBank =
      mangoGroup?.rootBankAccounts?.[MNGO_INDEX]?.nodeBankAccounts?.[0]

    if (!mangoAccount || !mngoNodeBank || !mangoGroup || !wallet) {
      return
    }

    try {
      const txids = await mangoClient.redeemAllMngo(
        mangoGroup,
        mangoAccount,
        wallet.adapter,
        mangoGroup.tokens[MNGO_INDEX].rootBank,
        mngoNodeBank.publicKey,
        mngoNodeBank.vault
      )
      actions.reloadMangoAccount()
      setMngoAccrued(ZERO_BN)
      if (txids) {
        for (const txid of txids) {
          notify({
            title: t('redeem-success'),
            description: '',
            txid,
          })
        }
      } else {
        notify({
          title: t('redeem-failure'),
          description: t('transaction-failed'),
          type: 'error',
        })
      }
    } catch (e) {
      notify({
        title: t('redeem-failure'),
        description: e.message,
        txid: e.txid,
        type: 'error',
      })
    }
  }

  const fetchProfileDetails = async (walletPk: string) => {
    setLoadProfileDetails(true)
    try {
      const response = await fetch(
        `https://mango-transaction-log.herokuapp.ca/v3/user-data/profile-details?wallet-pk=${walletPk}`
      )
      const data = await response.json()
      setProfileData(data)
      setLoadProfileDetails(false)
    } catch (e) {
      notify({ type: 'error', title: t('profile:profile-fetch-fail') })
      console.log(e)
      setLoadProfileDetails(false)
    }
  }

  return (
    <div className="pt-6">
      <div className="flex flex-col pb-4 lg:flex-row lg:items-end lg:justify-between">
        {null}
      </div>
      <div>
        {true ? (
          !isMobile ? (
            <div className="mt-2">
              <Tabs
                activeTab={activeTab}
                onChange={handleTabChange}
                tabs={TABS}
              />
              <TabContent activeTab={activeTab} />
            </div>
          ) : (
            <div className="mt-2">
              <SwipeableTabs
                onChange={handleChangeViewIndex}
                items={TABS}
                tabIndex={viewIndex}
                width="w-40 sm:w-48"
              />
              <Swipeable
                index={viewIndex}
                onChangeIndex={handleChangeViewIndex}
              >
                <div>
                  <AccountOverview />
                </div>
                <div>
                  <AccountOrders />
                </div>
                <div>
                  <AccountHistory />
                </div>
                <div>
                  <AccountPerformancePerToken />
                </div>
              </Swipeable>
            </div>
          )
        ) : isLoading && (connected || pubkey) ? (
          <div className="flex justify-center py-10">
            <Loading />
          </div>
        ) : connected ? (
          <div className="-mt-4 rounded-lg border border-th-bkg-3 p-4 md:p-6">
            <EmptyState
              buttonText={t('create-account')}
              icon={<CurrencyDollarIcon />}
              onClickButton={() => setShowAccountsModal(true)}
              title={t('no-account-found')}
              disabled={!wallet || !mangoGroup}
            />
          </div>
        ) : (
          <div className="-mt-4 rounded-lg border border-th-bkg-3 p-4 md:p-6">
            <EmptyState
              buttonText={t('connect')}
              desc={t('connect-view')}
              disabled={!wallet || !mangoGroup}
              icon={<LinkIcon />}
              onClickButton={handleConnect}
              title={t('connect-wallet')}
            />
            {!connected && !pubkey ? (
              <div className="flex flex-col items-center pt-2">
                <p>OR</p>
                <MangoAccountLookup />
              </div>
            ) : null}
          </div>
        )}
      </div>

      {showAccountsModal ? (
        <AccountsModal
          onClose={handleCloseAccounts}
          isOpen={showAccountsModal}
        />
      ) : null}
      {showNameModal ? (
        <AccountNameModal
          accountName={mangoAccount?.name}
          isOpen={showNameModal}
          onClose={handleCloseNameModal}
        />
      ) : null}
      {showCloseAccountModal ? (
        <CloseAccountModal
          isOpen={showCloseAccountModal}
          onClose={handleCloseCloseAccountModal}
        />
      ) : null}
      {showAlertsModal ? (
        <CreateAlertModal
          isOpen={showAlertsModal}
          onClose={handleCloseAlertModal}
        />
      ) : null}
      {showDelegateModal ? (
        <DelegateModal
          delegate={mangoAccount?.delegate}
          isOpen={showDelegateModal}
          onClose={handleCloseDelegateModal}
        />
      ) : null}
      {showProfilePicModal ? (
        <NftProfilePicModal
          isOpen={showProfilePicModal}
          onClose={handleCloseProfilePicModal}
        />
      ) : null}
    </div>
  )
}

const TabContent = ({ activeTab }) => {
  switch (activeTab) {
    case 'Overview':
      return <AccountOverview />
    case 'Orders':
      return <AccountOrders />
    case 'History':
      return <AccountHistory />
    case 'Performance':
      return <AccountPerformancePerToken />
    default:
      return <AccountOverview />
  }
}
