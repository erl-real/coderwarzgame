# Chapter App Hooks

This reference pulls directly from `apps/ops-nexus.html` (see `buildCampaignChapters`) so the campaign remains tightly coupled to the apps that actually unlock and gate each act. Every act log below lists the boss, the core apps that feed Ops Nexus requirements, and the route-specific tooling that should light up in the UI, phone/comms, and widget surfaces.

| Act | Boss | Core Apps | Ghost | Crown | Void |
| --- | ---- | --------- | ----- | ----- | ---- |
| Entry | Relay Widow | `email`, `file-scrape`, `net-scanner` | `email` + `file-scrape` | `wallet`, `bank-app` | `wire-viz`, `net-scanner` |
| Discovery | Bishop Hex | `wire-viz`, `packet-sniffer`, `vpn` | `vpn`, `packet-sniffer` | `dark-web`, `wallet` | `wire-viz`, `sat-map`, `packet-sniffer` |
| Corporate Shadows | Proxy Saint | `bank-app`, `pass-cracker`, `sql-inj` | `bank-app` | `biz-manager`, `sql-inj` | `pass-cracker`, `phone-mirror` |
| Underground Networks | MorrowGlass | `drone-control`, `crew-manager`, `chatroom` | `drone-control` | `crew-manager`, `biz-manager` | `chatroom`, `wire-viz`, `virus-builder` |
| Digital Arms Race | Arsenic Prince | `virus-builder`, `exploit-analyzer`, `vm` | `email`, `exploit-analyzer` | `wallet`, `vm` | `virus-builder`, `void-compiler` |
| Ghost Networks | Pale Switch | `proxy`, `firewall-manager`, `node-mgr` | `email`, `proxy` | `node-mgr`, `firewall-manager` | `dark-web`, `void-compiler`, `proxy` |
| Information Warfare | Broadcast Jackal | `news-app`, `script-mgr`, `chat-exporter` | `news-app`, `chat-exporter` | `script-mgr`, `chatroom` | `wire-viz`, `script-mgr` |
| Hidden Architect | Director Vale | `sat-map`, `archive-manager`, `backup-downloader` | `email`, `archive-manager` | `sat-map`, `biz-manager` | `backup-downloader`, `void-compiler` |
| Global Instability | Hydra Regent | `thermal-manager`, `software-repair`, `hdd-cloner` | `software-repair`, `hdd-cloner` | `biz-manager`, `thermal-manager` | `thermal-manager`, `wire-viz` |
| Betrayal Protocol | Turncoat Zero | `phone-link`, `phone-mirror`, `remote-pc`, `locate-device` | `phone-link`, `locate-device` | `remote-pc`, `phone-mirror` | `phone-mirror`, `vm` |
| Truth Layer | Archivist One | `archive-manager`, `file-compresser`, `cloud-vault`, `void-compiler` | `archive-manager`, `cloud-vault` | `file-compresser`, `wallet` | `void-compiler`, `wire-viz` |
| System Override | Cabinet of Ash | `biz-manager`, `crew-manager`, `sat-map`, `proxy` | `email`, `sat-map` | `biz-manager`, `wallet`, `crew-manager` | `sat-map`, `virus-builder`, `void-compiler` |
| Final Network War | King Null | `virus-builder`, `void-compiler`, `wire-viz`, `defender` | `email`, `pass-cracker`, `defender` | `biz-manager`, `crew-manager`, `defender` | `wire-viz`, `virus-builder`, `void-compiler` |

### Notification + Phone Hooks
- `seed()` pushes two mandatory dispatches (`normDispatch`) so the phone/comms surfaces are busy on the first login:
  - Sender: `CONTACTS.handler` (mail) explains Ops Nexus campaign mode and gives the war framing.
  - Sender: `CONTACTS.partner` (phone) teases the ghost route and prioritizes phone links, so every campaign act should surface phone notifications and partner chats (`phone-link`, `phone-mirror`, `locate-device`).
- `storyLog` also seeds a note about route commitment that should be echoed in the Phone Link "Campaign boot" section plus Ops Nexus quick tips (`storyCard`, `castCard`).
### Widget + News Interlocks
- `WIDGET_CATALOG` and `DesktopWidgetsLayer` already keep the weather widget aligned with the player city and broadcast the state via `state.widgets`. The weather data surfaces inside `news-app` (see feed entry `world-weather`), so the weather widget should animate or highlight when `news-app` shows a `trace` spike.
- The PCMeters widget draws live system health. Thoughts for refinement: tie `pcm` metrics to apps like `thermal-manager`/`software-repair` in `chapter-9` and highlight whichever act is closest to overheating (`act 9` global instability, `act 12` override).

Use this reference when wiring buttons, story prompts, or placeholder data in `news-app`, `widgets`, `phone-link`, `ops-nexus`, and other UI surfaces; each act now has a clear list of apps, bosses, and routes that should unlock mission flows or notifications.
