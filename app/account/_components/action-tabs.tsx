import { type IconName } from '@/lib/icons'
import { type ReactNode } from 'react'
import { AddressBook } from './address-book'
import { DetailStory } from './detail-story'
import { EmbeddedDetail } from './embedded-detail'
import { type FlowNode } from './flow'
import { SendPanel } from './send-panel'
import { TopMarketQuotes } from './top-market-quotes'

export interface ActionTab {
  id: string
  label: string
  icon: IconName
  description: string
  summary: ReactNode
  nodes: FlowNode[]
}
export const ACTION_TABS: ActionTab[] = [
  {
    id: 'overview',
    label: 'Dashboard',
    icon: 'dashboard',
    description: 'Start at the account overview, then drill into the controls that change how the workspace behaves.',
    summary: (
      <DetailStory
        eyebrow='Dashboard'
        title='Account command center'
        description='This tab behaves like a settings workspace instead of a single page. Pick a topic from the left, keep prior columns visible, and move deeper without losing context.'
        metrics={[
          { label: 'Portfolio', value: '$69.3k' },
          { label: 'Wallets', value: '12 active' },
          { label: 'Status', value: 'Stable' }
        ]}
        points={[
          {
            title: 'Persistent context',
            description:
              'Each step opens a new column to the right so the originating section stays visible while you inspect details.'
          },
          {
            title: 'Operational focus',
            description:
              'The dashboard is now organized around actions and settings rather than a monolithic surface that swaps in place.'
          },
          {
            title: 'Fast comparison',
            description: 'This layout makes it easier to compare balances, controls, and session policies side by side.'
          }
        ]}
        note='Use this as the landing pane. Once a section is selected, the next list appears immediately to the right and the detail pane updates at the edge.'
      />
    ),
    nodes: [
      {
        id: 'wallet-overview',
        label: 'Wallet',
        eyebrow: 'Snapshot',
        description: 'Balances, route health, and current operating posture.',
        badge: 'Live',
        content: (
          <DetailStory
            eyebrow='Snapshot'
            title='Wallet overview'
            description='Use the next column to move between holdings, routing health, and risk posture while keeping the high-level wallet section visible.'
            metrics={[
              { label: 'Net balance', value: '$69,348' },
              { label: 'Available', value: '91%' },
              { label: 'Delta 24h', value: '+4.8%' }
            ]}
            points={[
              {
                title: 'Holdings',
                description:
                  'Inspect the current balance mix and quickly see what is liquid enough for outbound transfers.'
              },
              {
                title: 'Routing health',
                description:
                  'Check whether your preferred inbound and outbound rails are usable before you initiate movement.'
              }
            ]}
            note='This preview pane stays open until you choose a more specific view from the adjacent column.'
          />
        ),
        children: [
          {
            id: 'holdings',
            label: 'Holdings',
            eyebrow: 'Balances',
            description: 'Current balance mix and liquid inventory.',
            content: (
              <DetailStory
                eyebrow='Balances'
                title='Holdings'
                description='Track the current balance mix and isolate what is actually available for movement instead of counting every wallet equally.'
                metrics={[
                  { label: 'USD value', value: '$69,348' },
                  { label: 'Liquid', value: '$63,124' },
                  { label: 'Watched', value: '4 assets' }
                ]}
                points={[
                  {
                    title: 'Liquid capital',
                    description:
                      'The majority of value is immediately available for sends or funding actions without intermediate routing.'
                  },
                  {
                    title: 'Reserved inventory',
                    description: 'A smaller slice stays ring-fenced for pending settlements and policy buffers.'
                  }
                ]}
                note='If this becomes real data later, the current pane is already structured for balances, buckets, and warnings.'
              />
            )
          },
          {
            id: 'routing-health',
            label: 'Routing health',
            eyebrow: 'Rails',
            description: 'Inbound and outbound route readiness.',
            content: (
              <DetailStory
                eyebrow='Rails'
                title='Routing health'
                description='Use this view to confirm that the preferred movement paths are available before you push volume through them.'
                metrics={[
                  { label: 'Onchain', value: 'Healthy' },
                  { label: 'Fiat rail', value: 'Warm' },
                  { label: 'Fallbacks', value: '2 ready' }
                ]}
                points={[
                  {
                    title: 'Primary routes',
                    description:
                      'Preferred routes are healthy and can absorb regular movement without manual intervention.'
                  },
                  {
                    title: 'Fallback posture',
                    description:
                      'At least two alternatives remain available if a funding route goes soft or a settlement path slows down.'
                  }
                ]}
                note='Routing state is the kind of information that benefits from this layout because the parent section remains visible while you inspect route-specific detail.'
              />
            )
          },
          {
            id: 'risk-posture',
            label: 'Risk posture',
            eyebrow: 'Guardrails',
            description: 'Exposure bands and operating constraints.',
            content: (
              <DetailStory
                eyebrow='Guardrails'
                title='Risk posture'
                description='Keep risk constraints close to balance and routing context so operational decisions are made with the right frame of reference.'
                metrics={[
                  { label: 'Exposure', value: 'Moderate' },
                  { label: 'Policy drift', value: '0' },
                  { label: 'Flags', value: 'None' }
                ]}
                points={[
                  {
                    title: 'Exposure discipline',
                    description:
                      'Current allocations stay within the intended tolerance bands and do not require corrective transfers.'
                  },
                  {
                    title: 'Policy alignment',
                    description:
                      'No mismatches exist between live behavior and the operating rules encoded for the workspace.'
                  }
                ]}
                note='This should become the place where transfer policies and route limits are explained, not just listed.'
              />
            )
          }
        ]
      },
      {
        id: 'workspace-preferences',
        label: 'Preferences',
        eyebrow: 'Controls',
        description: 'Appearance, alerts, and session visibility.',
        content: (
          <DetailStory
            eyebrow='Controls'
            title='Workspace preferences'
            description='Preferences are grouped into drill-down topics so the main list stays stable while the detail surface changes to the right.'
            metrics={[
              { label: 'Theme', value: 'Adaptive' },
              { label: 'Density', value: 'Comfortable' },
              { label: 'Alerts', value: 'Selective' }
            ]}
            points={[
              {
                title: 'Display controls',
                description:
                  'Keep density, theme, and information hierarchy together instead of spreading them across unrelated panels.'
              },
              {
                title: 'Signal controls',
                description:
                  'Tune alerts and session visibility in adjacent views without navigating away from the parent grouping.'
              }
            ]}
            note='This branch mirrors how X keeps the higher-level settings group visible while you inspect narrower subtopics.'
          />
        ),
        children: [
          {
            id: 'appearance',
            label: 'Appearance',
            eyebrow: 'Display',
            description: 'Theme, contrast, and spatial density.',
            content: (
              <DetailStory
                eyebrow='Display'
                title='Appearance'
                description='Use this slot for theme defaults, surface density, and any visual toggles that change how dense the workspace feels.'
                metrics={[
                  { label: 'Theme', value: 'System' },
                  { label: 'Contrast', value: 'Standard' },
                  { label: 'Density', value: 'Medium' }
                ]}
                points={[
                  {
                    title: 'Surface density',
                    description:
                      'Density should be controlled centrally so the columns maintain a consistent information rhythm.'
                  },
                  {
                    title: 'Theme defaults',
                    description: 'Theme choices belong here instead of being scattered across isolated modal controls.'
                  }
                ]}
                note='The current app already has a theme toggle. This view creates the right place to expand that into a complete preference set.'
              />
            )
          },
          {
            id: 'alerts',
            label: 'Alerts',
            eyebrow: 'Signals',
            description: 'Notifications for movement, limits, and drift.',
            content: (
              <DetailStory
                eyebrow='Signals'
                title='Alerts'
                description='Alert configuration works better in a dedicated detail pane where thresholds and examples can sit next to the relevant descriptions.'
                metrics={[
                  { label: 'Funding', value: 'Enabled' },
                  { label: 'Send', value: 'High only' },
                  { label: 'Drift', value: 'Daily' }
                ]}
                points={[
                  {
                    title: 'Movement alerts',
                    description:
                      'Notify on funding and send events when they exceed a meaningful threshold instead of for every transaction.'
                  },
                  {
                    title: 'Policy drift',
                    description:
                      'Flag when route behavior or session posture deviates from the declared operating model.'
                  }
                ]}
                note='The point of the cascading layout is that alert policy can be inspected with its parent control group still in view.'
              />
            )
          },
          {
            id: 'session-visibility',
            label: 'Session visibility',
            eyebrow: 'Session',
            description: 'What the account shell exposes and when.',
            content: (
              <DetailStory
                eyebrow='Session'
                title='Session visibility'
                description='This pane should eventually describe which account details appear by default and what requires explicit expansion.'
                metrics={[
                  { label: 'Auth age', value: 'Recent' },
                  { label: 'Exposure', value: 'Scoped' },
                  { label: 'Audit trail', value: 'On' }
                ]}
                points={[
                  {
                    title: 'Scoped disclosure',
                    description:
                      'Only expose sensitive data when the user moves into the relevant panel or explicitly requests it.'
                  },
                  {
                    title: 'Auditability',
                    description:
                      'Session-sensitive changes should be explainable from the same workspace where the controls live.'
                  }
                ]}
                note='This is a good candidate for future server-verified session details because the surrounding layout already supports stepwise disclosure.'
              />
            )
          }
        ]
      },
      {
        id: 'quotes',
        label: 'Quotes',
        eyebrow: 'Cryptocurrency',
        description: 'Top 10 assets by market cap from CoinMarketCap.',
        badge: 'live',
        content: <TopMarketQuotes />
      }
    ]
  },
  {
    id: 'funding',
    label: 'Funding',
    icon: 'money-receive-circle',
    description:
      'Model inbound routes as drill-down topics so deposit methods, limits, and reconciliation all live in the same flow.',
    summary: (
      <DetailStory
        eyebrow='Funding'
        title='Inbound rails'
        description='Use the list to move from high-level funding topics into route-specific detail. This keeps onboarding, limits, and settlement context visible while you drill down.'
        metrics={[
          { label: 'Routes', value: '4 total' },
          { label: 'Default', value: 'Onchain' },
          { label: 'Queue', value: 'Clear' }
        ]}
        points={[
          {
            title: 'Route-first model',
            description:
              'Funding is grouped around inbound methods instead of a single generic panel with unrelated controls mixed together.'
          },
          {
            title: 'Settlement clarity',
            description: 'The layout leaves room for route details and reconciliation rules to sit beside each other.'
          }
        ]}
        note='This mirrors the X settings flow: start from a topic list, then open details progressively to the right.'
      />
    ),
    nodes: [
      {
        id: 'deposit-routes',
        label: 'Deposit routes',
        eyebrow: 'Inbound',
        description: 'Choose how funds enter the account.',
        badge: 'Primary',
        content: (
          <DetailStory
            eyebrow='Inbound'
            title='Deposit routes'
            description='Use this group to select between onchain deposits, fiat rails, and the limits that shape inbound volume.'
            metrics={[
              { label: 'Preferred', value: 'Onchain' },
              { label: 'Fallback', value: 'Fiat rail' },
              { label: 'Limits', value: '2 active' }
            ]}
            points={[
              {
                title: 'Onchain route',
                description: 'Best for immediate availability and clear custody boundaries.'
              },
              {
                title: 'Fiat route',
                description: 'Useful when treasury operations need bank-side settlement or cash management workflows.'
              }
            ]}
            note='The right column should surface route-specific rules without forcing the user to leave the parent funding category.'
          />
        ),
        children: [
          {
            id: 'onchain-deposit',
            label: 'Onchain deposit',
            eyebrow: 'Route',
            description: 'Chain-aware inbound addresses and instructions.',
            content: (
              <DetailStory
                eyebrow='Route'
                title='Onchain deposit'
                description='This pane is the right place for deposit addresses, supported networks, and operational guidance for chain-specific funding.'
                metrics={[
                  { label: 'Networks', value: '3 active' },
                  { label: 'Address state', value: 'Ready' },
                  { label: 'Latency', value: 'Low' }
                ]}
                points={[
                  {
                    title: 'Address discipline',
                    description:
                      'Surface the network and destination context together so funding mistakes are less likely.'
                  },
                  {
                    title: 'Readiness signals',
                    description:
                      'Explain route health and confirmations in the same pane rather than burying them in detached tooltips.'
                  }
                ]}
                note='When real deposit addresses arrive, this panel already has enough structure to hold them cleanly.'
              />
            )
          },
          {
            id: 'fiat-rail',
            label: 'Fiat rail',
            eyebrow: 'Route',
            description: 'Bank-side instructions and settlement windows.',
            content: (
              <DetailStory
                eyebrow='Route'
                title='Fiat rail'
                description='Fiat funding usually needs more operational explanation, which is exactly what the rightmost detail pane is for.'
                metrics={[
                  { label: 'Status', value: 'Warm' },
                  { label: 'Window', value: 'T+0 / T+1' },
                  { label: 'Cutoff', value: '17:00' }
                ]}
                points={[
                  {
                    title: 'Settlement windows',
                    description: 'Display cutoffs, expected availability, and reconciliation assumptions in one place.'
                  },
                  {
                    title: 'Operator guidance',
                    description:
                      'Bank-side rails need more explanatory text than onchain routes, so they benefit from a dedicated detail surface.'
                  }
                ]}
                note='This should eventually hold routing instructions, not just a generic placeholder.'
              />
            )
          },
          {
            id: 'funding-limits',
            label: 'Funding limits',
            eyebrow: 'Policy',
            description: 'Thresholds that gate inbound movement.',
            content: (
              <DetailStory
                eyebrow='Policy'
                title='Funding limits'
                description='Tie inbound thresholds directly to the route group that enforces them instead of burying them in a separate generic settings form.'
                metrics={[
                  { label: 'Daily', value: '$250k' },
                  { label: 'Single', value: '$50k' },
                  { label: 'Review', value: 'Manual overage' }
                ]}
                points={[
                  {
                    title: 'Threshold policy',
                    description:
                      'Large inbound movements should clearly show when manual review or secondary checks are required.'
                  },
                  {
                    title: 'Route alignment',
                    description: 'Limits need to stay close to the funding method that triggers them.'
                  }
                ]}
                note='A cascading workspace makes policy inspection less brittle because the parent route list never disappears.'
              />
            )
          }
        ]
      },
      {
        id: 'settlement-controls',
        label: 'Settlement controls',
        eyebrow: 'Treasury',
        description: 'Manage sweep behavior and reconciliation.',
        content: (
          <DetailStory
            eyebrow='Treasury'
            title='Settlement controls'
            description='Group treasury-specific controls under one parent so automatic movement and reconciliation logic are visible together.'
            metrics={[
              { label: 'Sweep', value: 'Daily' },
              { label: 'Recon', value: 'Auto' },
              { label: 'Breaks', value: '0' }
            ]}
            points={[
              {
                title: 'Auto-sweep behavior',
                description:
                  'Control whether inbound funds stay local, consolidate, or move toward a preferred destination.'
              },
              {
                title: 'Reconciliation state',
                description:
                  'Show how inbound events reconcile to treasury expectations without forcing a context switch.'
              }
            ]}
            note='This category is ready for deeper controls if you decide to wire the funding model to real treasury actions.'
          />
        )
      },
      {
        id: 'funding-history',
        label: 'Funding history',
        eyebrow: 'History',
        description: 'Recent inbound events and exceptions.',
        badge: 'Queue clear',
        content: (
          <DetailStory
            eyebrow='History'
            title='Funding history'
            description='Use this pane for the inbound event trail so funding operations can be reviewed without leaving the funding workspace.'
            metrics={[
              { label: 'Today', value: '7 events' },
              { label: 'Exceptions', value: '0' },
              { label: 'Last sweep', value: '08:42' }
            ]}
            points={[
              {
                title: 'Inbound event trail',
                description:
                  'List recent deposits, route, availability status, and any attached notes or reconciliation markers.'
              },
              {
                title: 'Exception handling',
                description: 'Keep failures and delayed settlements close to the funding categories that produced them.'
              }
            ]}
            note='This remains a terminal pane, but the user still benefits from seeing the funding list beside it.'
          />
        )
      }
    ]
  },
  {
    id: 'send',
    label: 'Send Crypto',
    icon: 'money-send-square',
    description:
      'Compose transfers, inspect limits, and review recipient readiness without leaving the send workspace.',
    summary: (
      <DetailStory
        eyebrow='Send'
        title='Outbound transfers'
        description='The send area now follows the same cascading pattern: choose a transfer topic on the left, open the relevant subtopic, and keep the path visible while you act.'
        metrics={[
          { label: 'Ready', value: 'Yes' },
          { label: 'Recipients', value: 'Saved' },
          { label: 'Reviews', value: 'Scoped' }
        ]}
        points={[
          {
            title: 'Action-first flow',
            description:
              'Send operations stay organized around workflow steps instead of collapsing every control into a single card.'
          },
          {
            title: 'Lower navigation cost',
            description:
              'Recipient checks and policy limits live next to the transfer composer instead of in distant tabs.'
          }
        ]}
        note='Choose a send topic to open the next column. The terminal panel then stays anchored to the far right.'
      />
    ),
    nodes: [
      {
        id: 'network',
        label: 'Network',
        eyebrow: 'Workflow',
        description: 'Start a transfer or inspect approval rules.',
        // badge: 'Primary',
        content: (
          <DetailStory
            eyebrow='Workflow'
            title='Transfer workflow'
            description='This branch groups the actual transfer composer with the policy and approval views that shape whether a send can proceed.'
            metrics={[
              { label: 'Composer', value: 'Ready' },
              { label: 'Approvals', value: 'Required on high-value' },
              { label: 'Limits', value: 'Active' }
            ]}
            points={[
              {
                title: 'Compose',
                description: 'Launch the actual send form from the next step in the flow.'
              },
              {
                title: 'Policy checks',
                description: 'Review approvals and threshold logic beside the workflow that depends on them.'
              }
            ]}
            note='The X-style cascade works well here because policy context and action context can live side by side.'
          />
        ),
        children: [
          {
            id: 'btc',
            icon: 'btc',
            label: 'Bitcoin',
            eyebrow: 'Action',
            description: 'Open the current send form.',
            content: (
              <EmbeddedDetail
                eyebrow='Action'
                title='Bitcoin Transfer'
                description='This is the existing send experience, now mounted as the terminal pane in a cascading workflow.'>
                <SendPanel network='btc' />
              </EmbeddedDetail>
            )
          },
          {
            id: 'eth',
            label: 'Ethereum',
            icon: 'eth',
            eyebrow: 'Policy',
            description: 'Who needs to review high-risk movement.',
            content: (
              <EmbeddedDetail
                eyebrow='Action'
                title='Ethereum Transfer'
                description='This is the existing send experience, now mounted as the terminal pane in a cascading workflow.'>
                <SendPanel network='eth' />
              </EmbeddedDetail>
            )
            // content: (
            //   <DetailStory
            //     eyebrow='Policy'
            //     title='Approval rules'
            //     description='Approval policy belongs adjacent to the transfer workflow so operators can understand why a send did or did not proceed.'
            //     metrics={[
            //       { label: 'Auto-approve', value: '< $5k' },
            //       { label: 'Manual review', value: '$5k+' },
            //       { label: 'Escalation', value: 'Trusted recipients bypass' }
            //     ]}
            //     points={[
            //       {
            //         title: 'Threshold reviews',
            //         description:
            //           'High-value movement should explain which threshold was crossed and what additional review is required.'
            //       },
            //       {
            //         title: 'Recipient context',
            //         description:
            //           'Trusted recipients may follow a different policy path, which is why this view should stay close to the send workspace.'
            //       }
            //     ]}
            //     note='This pane is where approval logic becomes legible instead of implicit.'
            //   />
            // )
          },
          {
            id: 'send-limits',
            label: 'Send limits',
            icon: 'globe',
            eyebrow: 'Limits',
            description: 'Txn caps and route-specific thresholds.',
            content: (
              <DetailStory
                eyebrow='Limits'
                title='Send limits'
                description='Expose movement thresholds in a dedicated pane so they are easy to compare with the active send workflow.'
                metrics={[
                  { label: 'Per tx', value: '$25k' },
                  { label: 'Daily', value: '$100k' },
                  { label: 'Emergency hold', value: 'Available' }
                ]}
                points={[
                  {
                    title: 'Route limits',
                    description:
                      'Different routes can enforce different send caps, which is another reason to keep policy inside the same cascading area.'
                  },
                  {
                    title: 'Operational clarity',
                    description:
                      'Operators should not have to leave the send workflow to understand why a transaction is blocked.'
                  }
                ]}
                note='This is the policy complement to the actual send form.'
              />
            )
          }
        ]
      },
      {
        id: 'recipient-readiness',
        label: 'Recipient',
        eyebrow: 'Recipients',
        description: 'Verification, wallet quality, and trust state.',
        content: (
          <DetailStory
            eyebrow='Recipients'
            title='Recipient readiness'
            description='Keep recipient quality controls adjacent to outbound actions so the send workflow can explain what it trusts.'
            metrics={[
              { label: 'Trusted', value: '12' },
              { label: 'Needs review', value: '2' },
              { label: 'Stale', value: '1' }
            ]}
            points={[
              {
                title: 'Verification path',
                description:
                  'Surface who is trusted, who is stale, and what needs confirmation before money leaves the account.'
              },
              {
                title: 'Wallet quality',
                description:
                  'Explain network compatibility and freshness checks in the same surface where send decisions are made.'
              }
            ]}
            note='This category can later link directly into the contact book if you want send and contacts to overlap more tightly.'
          />
        )
      },
      {
        id: 'send-policies',
        label: 'Settings',
        eyebrow: 'Governance',
        description: 'Global send rules and enforcement posture.',
        content: (
          <DetailStory
            eyebrow='Governance'
            title='Send policies'
            description='Global send controls remain terminal, but they still benefit from the cascading layout because the send category list remains visible throughout.'
            metrics={[
              { label: 'Policy set', value: 'Strict' },
              { label: 'Overrides', value: 'Scoped' },
              { label: 'Exceptions', value: 'Manual only' }
            ]}
            points={[
              {
                title: 'Enforcement posture',
                description:
                  'Use this pane for the global rules that determine how strict the send system is allowed to be.'
              },
              {
                title: 'Exception path',
                description: 'When exceptions exist, they should be explicit and auditable from the same workspace.'
              }
            ]}
            note='This is a good home for any future policy editor or compliance summary.'
          />
        )
      }
    ]
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: 'address-book',
    description:
      'Treat the recipient book as a navigable workspace where directory, trust, and enrichment all sit in adjacent columns.',
    summary: (
      <DetailStory
        eyebrow='Contacts'
        title='Recipient network'
        description='The contact area now works like a settings workspace instead of a single destination. Choose a topic, then move into the detail pane that matters.'
        metrics={[
          { label: 'Contacts', value: 'Growing' },
          { label: 'Wallets', value: 'Tracked' },
          { label: 'Trust', value: 'Layered' }
        ]}
        points={[
          {
            title: 'Directory-first layout',
            description:
              'The address book becomes one terminal pane among several contact-oriented topics rather than the only surface.'
          },
          {
            title: 'Trust clarity',
            description:
              'Verification and enrichment can be kept next to the contact directory without forcing a context switch.'
          }
        ]}
        note='Select a contact topic to open the next column. The address book itself now appears at the edge of the flow.'
      />
    ),
    nodes: [
      {
        id: 'directory',
        label: 'Directory',
        eyebrow: 'Book',
        description: 'Manage saved contacts and wallet destinations.',
        badge: 'Primary',
        content: (
          <DetailStory
            eyebrow='Book'
            title='Directory'
            description='Use the next column to jump into the full address book or inspect trust controls that shape how recipients are treated.'
            metrics={[
              { label: 'Primary view', value: 'Address book' },
              { label: 'Trust checks', value: 'Available' },
              { label: 'Notes', value: 'Scoped' }
            ]}
            points={[
              {
                title: 'Address storage',
                description:
                  'Keep the concrete list of recipients and wallets one step deeper so the parent topic remains visible.'
              },
              {
                title: 'Recipient trust',
                description: 'Pair the contact directory with trust and enrichment controls in the same flow.'
              }
            ]}
            note='This is the clearest example of the desired pattern because a list-based tool benefits from staying nested under a stable parent.'
          />
        ),
        children: [
          {
            id: 'address-book',
            label: 'Address book',
            eyebrow: 'Directory',
            description: 'Open the full contact manager.',
            content: (
              <EmbeddedDetail
                eyebrow='Directory'
                title='Address book'
                description='This is the existing contact management experience, mounted as the terminal pane in the cascading account flow.'>
                <AddressBook />
              </EmbeddedDetail>
            )
          },
          {
            id: 'trust-settings',
            label: 'Trust settings',
            eyebrow: 'Trust',
            description: 'Verification and recipient confidence rules.',
            content: (
              <DetailStory
                eyebrow='Trust'
                title='Trust settings'
                description='Use a dedicated detail pane for recipient verification rules, freshness checks, and how trusted status changes transfer behavior.'
                metrics={[
                  { label: 'Verified', value: '8 recipients' },
                  { label: 'Pending', value: '2' },
                  { label: 'Expiry', value: '90 days' }
                ]}
                points={[
                  {
                    title: 'Verification rules',
                    description:
                      'Define what makes a recipient trusted and when that status should expire or require reconfirmation.'
                  },
                  {
                    title: 'Transfer impact',
                    description:
                      'Trusted status should influence send approvals, which is why this belongs near the address book rather than in isolation.'
                  }
                ]}
                note='This view turns trust from an implicit property into something the operator can actually inspect.'
              />
            )
          }
        ]
      },
      {
        id: 'enrichment',
        label: 'Enrichment',
        eyebrow: 'Context',
        description: 'Labels, notes, and internal recipient context.',
        content: (
          <DetailStory
            eyebrow='Context'
            title='Enrichment'
            description='Recipient enrichment belongs adjacent to the contact book so operators can add context without leaving the broader contact workspace.'
            metrics={[
              { label: 'Labels', value: 'Enabled' },
              { label: 'Notes', value: 'Per recipient' },
              { label: 'Grouping', value: 'Flexible' }
            ]}
            points={[
              {
                title: 'Operational notes',
                description:
                  'Capture payment context, routing preferences, and known caveats directly where the recipient data lives.'
              },
              {
                title: 'Grouping',
                description:
                  'Labels and groups are easier to reason about when they remain close to the directory that uses them.'
              }
            ]}
            note='If you later add tags or recipient cohorts, this pane is the right expansion point.'
          />
        )
      },
      {
        id: 'sharing',
        label: 'Sharing rules',
        eyebrow: 'Access',
        description: 'How contact data is exposed across the account.',
        content: (
          <DetailStory
            eyebrow='Access'
            title='Sharing rules'
            description='Use this pane for rules that govern where contact information can be surfaced or reused across the rest of the account.'
            metrics={[
              { label: 'Reuse', value: 'Scoped' },
              { label: 'Exports', value: 'Manual' },
              { label: 'Audit', value: 'On' }
            ]}
            points={[
              {
                title: 'Scoped reuse',
                description:
                  'Contact information should only appear where it meaningfully improves workflow, such as send composition.'
              },
              {
                title: 'Audit trail',
                description: 'Any sharing or export rule should remain explicit and reviewable.'
              }
            ]}
            note='This remains a terminal settings pane, but it still fits the same interaction model.'
          />
        )
      }
    ]
  },
  {
    id: 'tx',
    label: 'Transactions',
    icon: 'transaction-history',
    description: 'Review activity through nested ledger topics instead of a single flat history page.',
    summary: (
      <DetailStory
        eyebrow='Transactions'
        title='Ledger workspace'
        description='This area now follows the same cascading model as the rest of the account. Pick an activity topic, then move into the narrow detail you actually need.'
        metrics={[
          { label: 'Recent', value: '24 items' },
          { label: 'Pending', value: '2' },
          { label: 'Exports', value: 'Ready' }
        ]}
        points={[
          {
            title: 'Narrow the ledger',
            description:
              'Separate recent activity, pending work, and export tooling into adjacent topics rather than mixing them into one infinite list.'
          },
          {
            title: 'Keep the path visible',
            description:
              'The parent transaction list remains visible while you inspect pending items or export controls.'
          }
        ]}
        note='The same spatial model now applies across dashboard, funding, send, contacts, and transactions.'
      />
    ),
    nodes: [
      {
        id: 'activity',
        label: 'Activity',
        eyebrow: 'Ledger',
        description: 'Recent, pending, and exceptional events.',
        badge: '24 items',
        content: (
          <DetailStory
            eyebrow='Ledger'
            title='Activity'
            description='Use the adjacent column to focus on the slice of transaction history that actually matters for the current task.'
            metrics={[
              { label: 'Recent', value: '24' },
              { label: 'Pending', value: '2' },
              { label: 'Exceptions', value: '0' }
            ]}
            points={[
              {
                title: 'Recent trail',
                description: 'Show confirmed movement with the right summary density for quick scanning.'
              },
              {
                title: 'Pending work',
                description: 'Surface transactions that still need operator attention or route confirmation.'
              }
            ]}
            note='A nested ledger is easier to scan than a single generic history page.'
          />
        ),
        children: [
          {
            id: 'recent-activity',
            label: 'Recent activity',
            eyebrow: 'Recent',
            description: 'Confirmed and settled movement.',
            content: (
              <DetailStory
                eyebrow='Recent'
                title='Recent activity'
                description='This pane is structured for the recent confirmed transaction feed, with enough space for metadata and filtering context.'
                metrics={[
                  { label: 'Today', value: '11' },
                  { label: 'Settled', value: '11' },
                  { label: 'Avg size', value: '$4.2k' }
                ]}
                points={[
                  {
                    title: 'Confirmed trail',
                    description:
                      'Recent items can be presented with route, counterparty, and amount details without overwhelming the parent list.'
                  },
                  {
                    title: 'Filter context',
                    description:
                      'Because the higher-level activity topic stays visible, filters and drill-down state are easier to reason about.'
                  }
                ]}
                note='Hook a real transaction feed in here when the data model is ready.'
              />
            )
          },
          {
            id: 'pending-activity',
            label: 'Pending',
            eyebrow: 'Queue',
            description: 'Transactions still waiting on finality or review.',
            content: (
              <DetailStory
                eyebrow='Queue'
                title='Pending'
                description='Pending items deserve a dedicated pane so delay reasons, approval status, and next actions can be made explicit.'
                metrics={[
                  { label: 'In queue', value: '2' },
                  { label: 'Needs review', value: '1' },
                  { label: 'Route wait', value: '1' }
                ]}
                points={[
                  {
                    title: 'Why blocked',
                    description:
                      'The view should explain whether a transaction is waiting on approvals, route readiness, or settlement confirmation.'
                  },
                  {
                    title: 'Next action',
                    description:
                      'Pending work is only useful when the operator can see the next step required to clear it.'
                  }
                ]}
                note='Pending activity is a strong fit for a right-hand detail pane because it usually needs more narrative explanation than settled history.'
              />
            )
          }
        ]
      },
      {
        id: 'exports',
        label: 'Exports',
        eyebrow: 'Reporting',
        description: 'CSV and downstream delivery controls.',
        content: (
          <DetailStory
            eyebrow='Reporting'
            title='Exports'
            description='Export tooling belongs near the ledger so reporting and transaction history remain part of the same workflow.'
            metrics={[
              { label: 'CSV', value: 'Ready' },
              { label: 'API', value: 'Planned' },
              { label: 'Range', value: 'Custom' }
            ]}
            points={[
              {
                title: 'Ledger export',
                description: 'Generate time-bound extracts without leaving the transaction workspace.'
              },
              {
                title: 'Downstream delivery',
                description:
                  'If you later support delivery hooks or reporting integrations, this pane is already shaped for them.'
              }
            ]}
            note='Exports often need surrounding context like filters and ledger slice, so they belong inside the same cascade.'
          />
        )
      },
      {
        id: 'retention',
        label: 'Retention rules',
        eyebrow: 'Policy',
        description: 'How long ledger data remains available in the UI.',
        content: (
          <DetailStory
            eyebrow='Policy'
            title='Retention rules'
            description='Use this pane for retention, archival behavior, and any constraints on how long transaction data stays visible in the workspace.'
            metrics={[
              { label: 'UI window', value: '180 days' },
              { label: 'Archive', value: 'Cold storage' },
              { label: 'Deletion', value: 'Manual only' }
            ]}
            points={[
              {
                title: 'Retention policy',
                description:
                  'Make the UI retention window explicit so users understand the boundary between live history and archived data.'
              },
              {
                title: 'Archive path',
                description:
                  'Archival rules belong next to exports and history because they shape what the ledger can still surface.'
              }
            ]}
            note='This stays terminal, but it now follows the same interaction pattern as every other account area.'
          />
        )
      }
    ]
  }
]
