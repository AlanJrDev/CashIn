# Stats Page UI/UX Refactor Plan

## User Requests
1.  **Replace Emojis with Lucide Icons:** In the "Adições Rápidas" (now changing purpose) panel on the stats page, replace the current emojis with Lucide icons.
2.  **Adjust Button Styling:** Make these buttons smaller and style them like the toggles/buttons shown in reference image 2 (pill-shaped toggles, pink/blue/grey, with a white circle inside). Wait, the prompt says "como o nbotao de referencias em imagem seprada". Image 2 shows toggle switches. But the text says "esses botoes adicoinam informaçoes no grafico de gastos com base nos dados do usuarios e tambem tem que ter o de vendas e os tipos de venda". This implies these buttons act as *filters* or *data series toggles* for the chart, not as quick-add buttons anymore.
3.  **Change Chart Purpose:** The buttons are no longer for *adding* expenses quickly. They are for *adding the expense value to the chart* (i.e., toggling which data series are visible on the chart).
4.  **Add Income/Sales to Chart:** The chart needs to handle both expenses and income ("vendas e tipos de venda").
5.  **Change Chart Type:** The chart must look like the reference in image 3. Image 3 shows an Area Chart (line chart with filled area underneath, smooth curves) with multiple overlapping series (gradient fills), and a stacked bar chart below it. I will implement the smooth Area Chart for the main visualization, showing trends over time (e.g., daily expenses vs income).
6.  **General UI Updates:** Apply these changes globally if necessary.

## Implementation Steps
### 1. Refactor `src/app/dashboard/stats/page.tsx`
*   **Data Preparation:** Currently, the chart groups data by category for the whole month (BarChart). The reference area chart shows trends over time (likely days of the month). I need to re-process `transactions` to group by `date` (e.g., day 1, 2, ..., 31) and sum up `expenses` vs `income`, or specific categories if they are toggled.
*   **State Management:** Add state for which categories/types are currently active/visible on the chart (e.g., `activeFilters = ['expenses', 'income']` or specific categories like `['alimentação', 'transporte']`).
*   **Update Chart Component:** Replace `BarChart` with `AreaChart` from Recharts. Use `Area` components with `type="monotone"` for smooth curves, and use gradients for the fills to match the reference.
*   **Refactor Side Panel (Filters):**
    *   Change title from "Adição Rápida" to something like "Filtros do Gráfico".
    *   Replace emojis with Lucide icons.
    *   Style the buttons like the pill toggles in image 2.
    *   Make them act as toggles that update the `activeFilters` state, which in turn re-renders the chart.

### 2. Chart Data Structure (Time-series)
To make an area chart look like the reference, we need data points over a timeline.
```typescript
// Desired data structure for AreaChart
const data = [
  { name: '01', expense: 4000, income: 2400 },
  { name: '02', expense: 3000, income: 1398 },
  // ...
];
```

### 3. Toggle Button Styling
The reference image 2 shows pill-shaped toggle switches.
*   Active state: solid color (pink, blue) with a white circle on the left/right.
*   Inactive state: grey background.
We will build a custom Toggle component to match this.

Let's execute this.
