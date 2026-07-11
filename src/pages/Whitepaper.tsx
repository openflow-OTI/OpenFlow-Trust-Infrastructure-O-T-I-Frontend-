import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

interface Section {
  id: string
  number: string
  title: string
}

const SECTIONS: Section[] = [
  { id: 'executive-summary', number: '01', title: 'Executive Summary' },
  { id: 'about-openflow', number: '02', title: 'About OpenFlow' },
  { id: 'about-openflow-labs', number: '03', title: 'About OpenFlow Labs' },
  { id: 'the-problem', number: '04', title: 'The Problem' },
  { id: 'how-oti-works', number: '05', title: 'How OTI Works' },
  { id: 'supported-infrastructure', number: '06', title: 'Supported Infrastructure' },
  { id: 'use-cases', number: '07', title: 'Use Cases' },
  { id: 'wor', number: '08', title: 'The Wallet Ownership Registry (WOR)' },
  { id: 'distribution', number: '09', title: 'Distribution' },
  { id: 'revenue-model', number: '10', title: 'Revenue Model' },
  { id: 'openflow-vision', number: '11', title: 'The OpenFlow Vision' },
  { id: 'team', number: '12', title: 'Team' },
  { id: 'contact-links', number: '13', title: 'Contact & Links' },
]

function SignalTable() {
  return (
    <div className="whitepaper-table-wrap">
      <table className="whitepaper-table">
        <thead>
          <tr>
            <th scope="col">Signal</th>
            <th scope="col">Weight</th>
            <th scope="col">What It Measures</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Wallet Age</td>
            <td>25%</td>
            <td>How long this wallet has been active on-chain</td>
          </tr>
          <tr>
            <td>Transaction Count</td>
            <td>20%</td>
            <td>Volume and frequency of lifetime transactions</td>
          </tr>
          <tr>
            <td>Token Holding Behavior</td>
            <td>20%</td>
            <td>Diversity and quality of tokens held over time</td>
          </tr>
          <tr>
            <td>Smart Contract Interactions</td>
            <td>20%</td>
            <td>Depth of DeFi and protocol engagement</td>
          </tr>
          <tr>
            <td>Transaction Timing Patterns</td>
            <td>15%</td>
            <td>Consistency and naturalness of activity over time</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function TierTable() {
  return (
    <div className="whitepaper-table-wrap">
      <table className="whitepaper-table">
        <thead>
          <tr>
            <th scope="col">Score</th>
            <th scope="col">Label</th>
            <th scope="col">Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>85 – 100</td>
            <td>HIGHLY TRUSTED</td>
            <td>Long-established, organically active wallet</td>
          </tr>
          <tr>
            <td>65 – 84</td>
            <td>TRUSTED</td>
            <td>Solid behavioral history, low risk</td>
          </tr>
          <tr>
            <td>45 – 64</td>
            <td>CAUTION</td>
            <td>Moderate history, proceed carefully</td>
          </tr>
          <tr>
            <td>25 – 44</td>
            <td>SUSPICIOUS</td>
            <td>Thin history or unusual patterns</td>
          </tr>
          <tr>
            <td>0 – 24</td>
            <td>HIGH RISK</td>
            <td>New, inactive, or behaviorally anomalous</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function RevenueTable() {
  return (
    <div className="whitepaper-table-wrap">
      <table className="whitepaper-table">
        <thead>
          <tr>
            <th scope="col">Tier</th>
            <th scope="col">Access</th>
            <th scope="col">Limit</th>
            <th scope="col">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Anonymous</td>
            <td>No key required</td>
            <td>3 lookups/day</td>
            <td>Free</td>
          </tr>
          <tr>
            <td>Developer</td>
            <td>API key</td>
            <td>Higher daily limit</td>
            <td>Free</td>
          </tr>
          <tr>
            <td>Pro</td>
            <td>API key</td>
            <td>High volume</td>
            <td>Paid (planned)</td>
          </tr>
          <tr>
            <td>Enterprise</td>
            <td>Direct contract</td>
            <td>Unlimited + SLA</td>
            <td>Custom pricing</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function ContactTable() {
  return (
    <div className="whitepaper-table-wrap">
      <table className="whitepaper-table">
        <thead>
          <tr>
            <th scope="col">Resource</th>
            <th scope="col">Link</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Score a Wallet</td>
            <td><code>https://otiscore.vercel.app/score</code></td>
          </tr>
          <tr>
            <td>API Documentation</td>
            <td><a href="/docs/" style={{ color: '#00e5a0' }}>docs.otiscore.vercel.app</a></td>
          </tr>
          <tr>
            <td>GitHub</td>
            <td><span style={{ color: '#7a8fa8' }}>Coming soon</span></td>
          </tr>
          <tr>
            <td>Telegram Bot</td>
            <td><span style={{ color: '#7a8fa8' }}>Coming soon</span></td>
          </tr>
          <tr>
            <td>Discord Bot</td>
            <td><span style={{ color: '#7a8fa8' }}>Coming soon</span></td>
          </tr>
          <tr>
            <td>Email</td>
            <td><span style={{ color: '#7a8fa8' }}>Coming soon</span></td>
          </tr>
          <tr>
            <td>Twitter / X</td>
            <td><span style={{ color: '#7a8fa8' }}>Coming soon</span></td>
          </tr>
          <tr>
            <td>Crisp Chat</td>
            <td><span style={{ color: '#7a8fa8' }}>Coming soon</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function Whitepaper() {
  const [tocOpen, setTocOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id)
  const [showBackTop, setShowBackTop] = useState(false)
  const [readProgress, setReadProgress] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const headings = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
      },
    )

    headings.forEach((el) => observerRef.current!.observe(el))

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  useEffect(() => {
    function onScroll() {
      setShowBackTop(window.scrollY > 400)
      const el = document.documentElement
      const scrolled = el.scrollTop || document.body.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setReadProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handlePrint() {
    window.print()
  }

  return (
    <div className="marketing-page whitepaper-page">
      <div className="whitepaper-progress-bar" style={{ width: `${readProgress}%` }} aria-hidden="true" />
      <MarketingNavbar />

      <header className="whitepaper-header">
        <div className="whitepaper-header-watermark" aria-hidden="true" />
        <div className="marketing-container whitepaper-header-inner">
          <h1 className="whitepaper-title">OpenFlow Trust Infrastructure — Whitepaper</h1>
          <p className="whitepaper-subtitle">
            Version 1.0 · July 2026 · OpenFlow Labs
            <span className="whitepaper-read-time" aria-label="Estimated read time">· ~16 min read</span>
          </p>
          <div className="whitepaper-header-ctas">
            <button type="button" className="marketing-btn marketing-btn--outline" onClick={handlePrint}>
              Download PDF
            </button>
            <Link to="/score" className="marketing-btn marketing-btn--primary">
              Score a Wallet →
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile "Jump to section" accordion — hidden on desktop via CSS */}
      <div className="marketing-container whitepaper-toc-mobile">
        <button
          type="button"
          className="whitepaper-toc-mobile-toggle"
          aria-expanded={tocOpen}
          onClick={() => setTocOpen((v) => !v)}
        >
          Jump to section
          <span className={`whitepaper-toc-mobile-caret ${tocOpen ? 'is-open' : ''}`} aria-hidden="true">▾</span>
        </button>
        {tocOpen && (
          <nav className="whitepaper-toc-mobile-list" aria-label="Table of contents">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} onClick={() => setTocOpen(false)}>
                <span className="whitepaper-toc-number">{s.number}</span> {s.title}
              </a>
            ))}
          </nav>
        )}
      </div>

      <div className="marketing-container whitepaper-body">
        {/* Sticky TOC sidebar — desktop only via CSS */}
        <aside className="whitepaper-toc-desktop" aria-label="Table of contents">
          <nav className="whitepaper-toc-desktop-list">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={activeId === s.id ? 'is-active' : ''}>
                <span className="whitepaper-toc-number">{s.number}</span> {s.title}
              </a>
            ))}
          </nav>
        </aside>

        <main className="whitepaper-content">
          <section id="executive-summary" className="whitepaper-section">
            <h2><span className="whitepaper-section-number">01</span> Executive Summary</h2>
            <p>
              OpenFlow Trust Infrastructure (OTI) is an independent on-chain trust verification platform that
              enables any application, protocol, exchange, or marketplace to instantly assess the behavioral
              trustworthiness of any blockchain wallet address. Given a wallet address and a supported chain, OTI
              returns a deterministic 0–100 trust score derived from five on-chain behavioral signals — without
              requiring identity disclosure, KYC, or off-chain data.
            </p>
            <p>
              OTI is the first public product developed by OpenFlow Labs, the research and engineering division of
              OpenFlow, a Nigerian technology company building the foundational infrastructure for the emerging
              attention economy. OTI is intentionally designed as an independent infrastructure business, serving
              external developers, protocols, DAOs, marketplaces, and enterprises, while simultaneously acting as
              the trust verification layer that powers OpenFlow's broader ecosystem.
            </p>
          </section>

          <section id="about-openflow" className="whitepaper-section">
            <h2><span className="whitepaper-section-number">02</span> About OpenFlow</h2>
            <p>
              OpenFlow is a technology company based in Nigeria, focused on building the next generation of digital
              trust and attention infrastructure for Web3 and beyond. Our mission is to transform attention into a
              verifiable economic asset by creating systems where value is exchanged only after trust has been
              established.
            </p>
            <p>
              Rather than building a single application, OpenFlow is developing an ecosystem of interoperable
              technologies that enable businesses, creators, advertisers, protocols, and communities to measure,
              verify, and monetize genuine human participation. Through infrastructure, economic design, and open
              standards, OpenFlow aims to become a foundational layer for the emerging attention economy.
            </p>
          </section>

          <section id="about-openflow-labs" className="whitepaper-section">
            <h2><span className="whitepaper-section-number">03</span> About OpenFlow Labs</h2>
            <p>
              OpenFlow Labs is the research and engineering division of OpenFlow. It is responsible for designing,
              developing, and maintaining the technologies that power the OpenFlow ecosystem.
            </p>
            <p>
              The first product developed by OpenFlow Labs is OTI — an independent trust verification platform
              designed to help applications distinguish genuine users from bots, Sybil attackers, and low-quality
              engagement through verifiable on-chain signals.
            </p>
            <p>
              Although OTI is the first public product, it is only the beginning. OpenFlow Labs is building a
              portfolio of interconnected infrastructure products that will support the OpenFlow ecosystem over the
              coming years, including developer tools, trust services, attention verification technologies,
              reputation systems, APIs, SDKs, and future infrastructure for decentralized commerce and digital
              participation.
            </p>
            <p>
              OTI is intentionally designed as an independent infrastructure business. It serves external
              developers, protocols, DAOs, marketplaces, and enterprises while simultaneously acting as the trust
              layer that powers OpenFlow itself. This separation allows OTI to generate sustainable revenue from
              external customers, creating a cross-subsidization model that funds long-term research, infrastructure
              development, and future OpenFlow products without relying solely on token financing.
            </p>
          </section>

          <section id="the-problem" className="whitepaper-section">
            <h2><span className="whitepaper-section-number">04</span> The Problem</h2>
            <p>
              The internet is entering a new era where attention is one of the world's most valuable digital assets.
              But before attention can become valuable, it must first become trustworthy.
            </p>
            <p>
              Today, billions of dollars are lost every year to bots, fake engagement, Sybil attacks, and
              unverifiable digital interactions. Existing systems measure activity — but they rarely verify
              authenticity.
            </p>
            <p>In Web3 specifically, this problem is acute:</p>
            <ul>
              <li>Exchanges process withdrawal transactions to wallets they know nothing about</li>
              <li>DeFi protocols extend credit to wallets with no behavioral history</li>
              <li>NFT marketplaces display listings from wallets created minutes ago</li>
              <li>DAOs accept governance votes from freshly funded addresses</li>
              <li>P2P traders send funds to counterparties they cannot verify</li>
              <li>Launchpads are sybil-attacked by thousands of coordinated fresh wallets</li>
            </ul>
            <p>
              Every one of these platforms faces the same fundamental question: <strong>"Is this interaction
              genuine?"</strong>
            </p>
            <p>
              The Web3 ecosystem currently has no open, developer-accessible, chain-agnostic infrastructure to
              answer that question — until now.
            </p>
          </section>

          <section id="how-oti-works" className="whitepaper-section">
            <h2><span className="whitepaper-section-number">05</span> How OTI Works</h2>
            <p>
              OTI analyzes five on-chain behavioral signals for any wallet address on any supported chain. Each
              signal is scored 0–100, then weighted by its contribution to produce a final overall trust score.
            </p>
            <SignalTable />
            <p className="whitepaper-formula-label"><strong>Scoring formula:</strong></p>
            <p className="whitepaper-formula">
              <code>Overall Score = (WalletAge × 0.25) + (TxCount × 0.20) + (TokenHolding × 0.20) + (ContractInteractions × 0.20) + (TimingPatterns × 0.15)</code>
            </p>
            <p className="whitepaper-formula-label"><strong>Trust tiers:</strong></p>
            <TierTable />
            <p>
              All scoring is performed server-side using on-chain data only. No personally identifiable information
              is collected or required. All results are deterministic and reproducible.
            </p>
          </section>

          <section id="supported-infrastructure" className="whitepaper-section">
            <h2><span className="whitepaper-section-number">06</span> Supported Infrastructure</h2>
            <p>OTI currently supports 15 blockchain networks:</p>
            <p><strong>EVM chains (via Etherscan V2 API):</strong><br />
              Ethereum, Polygon, Arbitrum, Avalanche, Fantom, Linea, Scroll, zkSync, Sepolia, Holesky</p>
            <p><strong>Non-EVM chains:</strong><br />
              Solana, TON, Bitcoin, Sui, Tron</p>
            <p>
              Three additional high-volume chains — BNB Smart Chain, Base, and Optimism — are temporarily
              unavailable pending an infrastructure upgrade. Full coverage across all 18 networks is planned in a
              near-term release.
            </p>
          </section>

          <section id="use-cases" className="whitepaper-section">
            <h2><span className="whitepaper-section-number">07</span> Use Cases</h2>
            <p>OTI is applicable across every vertical in Web3 where trust between transacting parties matters.</p>

            <h3>Exchanges & Gateways</h3>
            <p>
              Screen withdrawal destinations before processing. Detect compromised wallets before funds leave the
              platform. Know the behavioral history of any recipient address in milliseconds.
            </p>

            <h3>DeFi Protocols</h3>
            <p>
              Risk-adjust collateral requirements and borrowing limits based on wallet trust. Score counterparties
              before executing credit decisions. Reduce protocol exposure to thin-history or bot-controlled wallets.
            </p>

            <h3>NFT Marketplaces</h3>
            <p>
              Display verifiable trust badges alongside seller listings. Filter out listings from wallets created
              hours before a sale. Give buyers confidence about the party on the other side of a high-value
              transaction.
            </p>

            <h3>Payment Processors</h3>
            <p>
              Require a minimum trust score before processing outbound crypto payments. Reduce fraud exposure
              without requiring identity documents or KYC workflows.
            </p>

            <h3>Web3 Gaming</h3>
            <p>
              Prevent Sybil attacks and reward farming in Play-to-Earn ecosystems. Verify wallet behavioral
              legitimacy before distributing tokens or prizes. Maintain fair economic environments for genuine
              players.
            </p>

            <h3>DAO Governance</h3>
            <p>
              Supplement token-based voting with trust-weighted participation. Reduce governance attacks from
              freshly funded wallets. Reward long-term ecosystem participants with governance influence proportional
              to their verifiable history.
            </p>

            <h3>Custody Services</h3>
            <p>
              Score incoming transfer sources before crediting accounts. Flag wallets showing anomalous timing or
              concentration patterns. Add a behavioral layer to existing compliance workflows.
            </p>

            <h3>Cross-Chain Bridges</h3>
            <p>
              Score the source wallet before allowing a bridge transaction. Stop compromised or high-risk wallets
              at the bridge gate rather than after funds have moved.
            </p>

            <h3>Developer Tooling & Embeds</h3>
            <p>
              Any Web3 product — portfolio trackers, wallet browsers, analytics dashboards, on-chain explorers — can
              embed OTI trust scores with a single API call. No blockchain infrastructure required on the
              integrator's side.
            </p>
          </section>

          <section id="wor" className="whitepaper-section">
            <h2><span className="whitepaper-section-number">08</span> The Wallet Ownership Registry (WOR)</h2>
            <p>The Wallet Ownership Registry is OTI's planned flagship trust feature — a system with no equivalent in the market.</p>
            <p>
              <strong>The problem:</strong> When a blockchain wallet is compromised, the attacker has copied the
              private key. This means the original owner and the attacker both have identical signing authority.
              Simply connecting a wallet or signing a message does not prove you are the original owner — the
              attacker can do the same.
            </p>
            <p><strong>The OTI solution — pre-registration with a passkey:</strong></p>
            <ol>
              <li>A wallet owner connects their wallet to OTI before any compromise occurs</li>
              <li>OTI generates a cryptographic challenge</li>
              <li>The owner signs off-chain (EIP-191, zero gas cost)</li>
              <li>OTI verifies the signature and records the registration</li>
              <li>The owner sets a secret passkey — stored as a hash, never in plain text</li>
            </ol>
            <p>
              If the wallet is later compromised, the original owner can submit a compromise report by connecting
              the wallet AND entering the pre-registered passkey. OTI verifies both — the wallet signature (which
              the attacker can also do) AND the passkey hash match (which the attacker cannot replicate, because
              they were not present for the pre-registration).
            </p>
            <p>
              On successful verification: the wallet is immediately flagged as <code>compromised: true</code>. Its
              trust score drops to 0. Every API consumer using OTI is instantly aware. No admin review. No
              blockchain transaction. Fully automated. Real-time.
            </p>
            <p>
              This is the only system in Web3 where a wallet owner can definitively differentiate themselves from
              an attacker who holds the same private key.
            </p>
          </section>

          <section id="distribution" className="whitepaper-section">
            <h2><span className="whitepaper-section-number">09</span> Distribution</h2>
            <p>OTI reaches developers through four zero-infrastructure distribution channels, all planned for post-MVP launch:</p>
            <p>
              <strong>Telegram Bot</strong> — Community users can query any wallet score directly in Telegram groups
              or DMs. Every bot reply carries OTI branding. Group mode is the primary viral lever: a single reply in
              a public crypto community reaches hundreds of viewers simultaneously.
            </p>
            <p>
              <strong>Discord Bot</strong> — Slash command integration for Web3 Discord servers. Rich embed
              responses with score breakdown, signal bars, and trust tier. DeFi and NFT communities are the primary
              target — exactly the integrations we want to reach.
            </p>
            <p>
              <strong>Embeddable Widget</strong> — A single-line JavaScript embed for any website. Site operators
              drop one <code>&lt;script&gt;</code> tag and OTI renders a live trust badge next to any wallet
              address. Target platforms: NFT marketplaces, OTC trading boards, blockchain analytics sites, portfolio
              trackers.
            </p>
            <p>
              <strong>Browser Extension</strong> — A Chrome and Firefox extension that automatically detects wallet
              addresses on any webpage (Etherscan, OpenSea, BscScan, Blur, and beyond) and injects OTI trust badges
              inline. Zero effort from the user after installation.
            </p>
            <p className="whitepaper-formula-label"><strong>The conversion funnel:</strong></p>
            <p>
              Community user sees OTI score in a bot reply → shares the score card (every share carries OTI
              branding) → developer discovers OTI → visits developer docs → gets a free API key → integrates into
              their product → product grows → becomes a paying business client → enterprise becomes a direct sales
              conversation.
            </p>
          </section>

          <section id="revenue-model" className="whitepaper-section">
            <h2><span className="whitepaper-section-number">10</span> Revenue Model</h2>
            <p>OTI operates a tiered API access model designed to convert community users into paying business clients over time.</p>
            <RevenueTable />
            <p>
              Infrastructure revenue generated by OTI API subscriptions creates a sustainable recurring income
              model. This cross-subsidizes OpenFlow Labs research and future OpenFlow ecosystem products, reducing
              dependence on token financing at early stages.
            </p>
            <p>
              The highest-value client category is <strong>exchanges and payment gateways</strong> — institutions
              that process millions of transactions and face the greatest exposure from unverified counterparties.
              OTI's enterprise offering for this segment is the primary path to significant revenue.
            </p>
          </section>

          <section id="openflow-vision" className="whitepaper-section">
            <h2><span className="whitepaper-section-number">11</span> The OpenFlow Vision</h2>
            <p>
              We believe the internet is entering a new era where attention becomes one of the world's most valuable
              digital assets. However, before attention can become valuable, it must first become trustworthy.
            </p>
            <p>OTI is the foundation of a larger vision: <strong>the OpenFlow Attention Economy</strong>.</p>
            <p>
              The OpenFlow Attention Economy introduces a new economic model where verified attention becomes an
              asset that can be measured, priced, exchanged, and rewarded across multiple ecosystems. Rather than
              treating attention as disposable advertising inventory, OpenFlow transforms genuine participation into
              economic value through transparent verification and sustainable economic design.
            </p>
            <p>OpenFlow combines two complementary models to support this vision:</p>
            <p>
              <strong>Infrastructure Revenue</strong> — generated by products such as OTI, creating sustainable
              recurring income through enterprise APIs, verification services, and developer tools. This funds
              operations and research independently of token markets.
            </p>
            <p>
              <strong>The OpenFlow Economy</strong> — powered by the FLOW ecosystem, which aligns participants
              through decentralized incentives and ecosystem growth.
            </p>
            <p>
              As adoption grows, OpenFlow plans to introduce both private and public token offerings to expand
              ecosystem participation and accelerate global development. Those fundraising events are intended to
              strengthen an already functioning ecosystem — not finance an idea. Our objective is to demonstrate
              real products, real users, and sustainable infrastructure before inviting broader community ownership.
            </p>
            <p>
              Ultimately, our ambition is not simply to build another Web3 platform, but to establish the global
              infrastructure where trust enables value, and verified attention powers a new digital economy.
            </p>
          </section>

          <section id="team" className="whitepaper-section">
            <h2><span className="whitepaper-section-number">12</span> Team</h2>
            <h3>Ahmad Alhassan (Dan Shila)</h3>
            <p><em>Co-Founder & Chief Executive Officer</em></p>
            <p>
              Ahmad Alhassan is a technology entrepreneur and systems designer from Nigeria with a strong passion
              for building long-term digital infrastructure. He leads the vision, architecture, product strategy,
              and economic design behind OpenFlow and OTI. His work focuses on solving fundamental problems of
              trust, attention verification, and sustainable value creation across decentralized ecosystems.
            </p>
            <h3>Mustapha Abdullahi (Musty)</h3>
            <p><em>Co-Founder</em></p>
            <p>
              Mustapha is the co-founder of OpenFlow and works alongside Ahmad in building the long-term vision of
              the ecosystem. Together they are focused on creating infrastructure that enables trustworthy digital
              participation and supports the growth of the OpenFlow Attention Economy.
            </p>
          </section>

          <section id="contact-links" className="whitepaper-section">
            <h2><span className="whitepaper-section-number">13</span> Contact & Links</h2>
            <ContactTable />
          </section>
        </main>
      </div>

      <MarketingFooter />

      <button
        type="button"
        className={`whitepaper-back-top ${showBackTop ? 'is-visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        ↑
      </button>
    </div>
  )
}
