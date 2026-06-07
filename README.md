# MAANG Stock Dashboard

![Dashboard preview](./maang.gif)

An interactive stock analytics dashboard for **Apple, Amazon, Google, Meta, and Netflix** built with React, [Flexmonster](https://www.flexmonster.com/) pivot tables, and [amCharts](https://www.amcharts.com/).
 
---


## Features

- **Pivot table** — month-over-month percentage change in closing prices across all five companies, with conditional formatting for negative values
- **Comparison line chart** — side-by-side view of monthly close price changes per company (2025)
- **Per-company pivot table** — monthly high/low price summary, selectable via company buttons
- **Column + line chart** — trading volume alongside monthly closing prices for the selected company
- **Candlestick chart** — OHLC (open/high/low/close) visualization with a scrollbar mini-map
- **Dark / Light mode** toggle with matching Flexmonster themes
---

## Tech Stack

| Library | Purpose |
|---|---|
| [React](https://react.dev/) | UI framework |
| [Flexmonster](https://www.flexmonster.com/) | Pivot tables & pivot charts |
| [amCharts 5](https://www.amcharts.com/) | Line & candlestick charts |
 
---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd <project-folder>
 
# Install dependencies
npm install
```

### Run in development

```bash
npm run dev
```

### Build for production

```bash
npm run build
```
 
---

## Flexmonster License

This project runs on the **free trial license**, which displays a Flexmonster watermark on all pivot tables or doesn't render pivot in case of trial key expiration.

To use Flexmonster without the watermark, purchase a commercial license on the [Flexmonster order page](https://www.flexmonster.com/order/). Once you have a license key, add it to your environment and pass it to the component:

1. Create a `.env` file in the project root:
```env
VITE_FLEXMONSTER_LICENSE=your_license_key_or_file_path_here
```

2. In `App.jsx`, update the `FlexPivot` component to use it:
```jsx
<FlexmonsterReact
  licenseFilePath={import.meta.env.VITE_FLEXMONSTER_LICENSE}
/>
```
 
---
