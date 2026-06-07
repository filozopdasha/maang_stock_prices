import React, { useEffect, useState } from "react";
import FlexmonsterReact from "react-flexmonster";
import "flexmonster/flexmonster.css";
import "./charts-fm.css"

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";

const companies = ["Apple", "Amazon", "Google", "Meta", "Netflix"];

const AMCHART_COLORS = [
    am5.color(0x003f5c),
    am5.color(0x58508d),
    am5.color(0xbc5090),
    am5.color(0xff6361),
    am5.color(0xffa600)
];
const COMPANY_COLOR_MAP = {
    Apple: "#003f5c",
    Amazon: "#58508d",
    Google: "#bc5090",
    Meta: "#ff6361",
    Netflix: "#ffa600"
};

const sectionTitleStyle = {
    fontSize: "22px",
    fontWeight: 700,
    marginBottom: "6px",
    letterSpacing: "0.2px"
};

const sectionDescriptionStyle = darkMode => ({
    fontSize: "14px",
    lineHeight: "1.6",
    maxWidth: "900px",
    marginBottom: "20px",
    color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)"
});

function ComparisonLineChart({ data, darkMode }) {
    useEffect(() => {
        const root = am5.Root.new("comparisonLineChart");
        root.setThemes([am5themes_Animated.new(root), darkMode ? am5themes_Dark.new(root) : null].filter(Boolean));

        const chart = root.container.children.push(
            am5xy.XYChart.new(root, {
                panX: true,
                wheelX: "panX",
                wheelY: "zoomX",
                layout: root.verticalLayout
            })
        );
        chart.get("colors").set("colors", AMCHART_COLORS);

        const xAxis = chart.xAxes.push(
            am5xy.DateAxis.new(root, {
                baseInterval: { timeUnit: "month", count: 1 },
                renderer: am5xy.AxisRendererX.new(root, {})
            })
        );

        const yAxis = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                renderer: am5xy.AxisRendererY.new(root, {})
            })
        );

        companies.forEach(company => {
            const companyData = data
                .filter(d => d.company === company)
                .sort((a, b) => a.date - b.date);

            const diffData = companyData.map((d, i) => {
                if (i === 0) return { ...d, diffClose: 0 };
                const prev = companyData[i - 1].close;
                const diff = d.close - prev
                return { ...d, diffClose: +diff.toFixed(2) };
            });

            const series = chart.series.push(
                am5xy.LineSeries.new(root, {
                    name: company,
                    xAxis,
                    yAxis,
                    valueXField: "date",
                    valueYField: "diffClose",
                    tooltip: am5.Tooltip.new(root, {
                        labelText: `${company}: {valueY}`
                    })
                })
            );

            series.data.setAll(diffData);
        });

        chart.children.push(am5.Legend.new(root, {}));
        chart.set("cursor", am5xy.XYCursor.new(root, {}));

        return () => root.dispose();
    }, [data, darkMode]);

    return <div id="comparisonLineChart" style={{ width: "100%", height: "500px" }} />;
}

function CandlestickChart({ data, darkMode }) {
    useEffect(() => {
        if (!data || data.length === 0) return;

        const root = am5.Root.new("candlestickChart");
        root.setThemes([am5themes_Animated.new(root), darkMode ? am5themes_Dark.new(root) : null].filter(Boolean));

        const chart = root.container.children.push(
            am5xy.XYChart.new(root, {
                panX: true,
                panY: true,
                wheelX: "panX",
                wheelY: "zoomX"
            })
        );

        const xAxis = chart.xAxes.push(
            am5xy.DateAxis.new(root, {
                baseInterval: { timeUnit: "month", count: 1 },
                renderer: am5xy.AxisRendererX.new(root, {}),
                tooltip: am5.Tooltip.new(root, {})
            })
        );

        const yAxis = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                renderer: am5xy.AxisRendererY.new(root, {})
            })
        );

        const series = chart.series.push(
            am5xy.CandlestickSeries.new(root, {
                name: "Price",
                xAxis,
                yAxis,
                valueXField: "date",
                openValueYField: "open",
                highValueYField: "high",
                lowValueYField: "low",
                valueYField: "close",
                tooltip: am5.Tooltip.new(root, {
                    labelText:
                        "Open: {openValueY}\nHigh: {highValueY}\nLow: {lowValueY}\nClose: {valueY}"
                })
            })
        );

        series.columns.template.states.create("riseFromOpen", {
            fill: am5.color(0x2e7d32),
            stroke: am5.color(0x2e7d32)
        });

        series.columns.template.states.create("dropFromOpen", {
            fill: am5.color(0xff6361),
            stroke: am5.color(0xff6361)
        });

        series.data.setAll(data);
        chart.set("cursor", am5xy.XYCursor.new(root, {}));

        const scrollbarX = am5xy.XYChartScrollbar.new(root, { orientation: "horizontal", height: 70 });
        chart.set("scrollbarX", scrollbarX);

        const sbXAxis = scrollbarX.chart.xAxes.push(
            am5xy.DateAxis.new(root, { baseInterval: { timeUnit: "month", count: 1 }, renderer: am5xy.AxisRendererX.new(root, {}) })
        );
        const sbYAxis = scrollbarX.chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, {}) }));
        const sbSeries = scrollbarX.chart.series.push(
            am5xy.LineSeries.new(root, { xAxis: sbXAxis, yAxis: sbYAxis, valueXField: "date", valueYField: "close" })
        );
        sbSeries.data.setAll(data);

        return () => root.dispose();
    }, [data, darkMode]);

    return <div id="candlestickChart" style={{ width: "100%", height: "650px" }} />;
}

function FlexPivot({ report, darkMode, keyProp }) {
    // Dynamically load dark/light theme CSS
    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = darkMode
            ? "https://cdn.flexmonster.com/theme/midnight/flexmonster.min.css"
            : "https://cdn.flexmonster.com/theme/default/flexmonster.min.css";
        document.head.appendChild(link);

        return () => document.head.removeChild(link);
    }, [darkMode]);

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <FlexmonsterReact
                key={keyProp}
                componentFolder="https://cdn.flexmonster.com/"
                licenseKey= {import.meta.env.VITE_FLEXMONSTER_LICENSE}
                report={report}
                width="100%"
                height="100%"
                toolbar={true}
            />
        </div>
    );
}

function App() {
    const [selectedCompany, setSelectedCompany] = useState("Apple");
    const [ohlcData, setOhlcData] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        fetch("/data/maang_monthly.csv")
            .then(res => res.text())
            .then(csv => {
                const rows = csv.split("\n").slice(1);

                const compData = rows
                    .map(r => {
                        const [date, , , , close, , , company] = r.split(",");
                        const d = new Date(date);
                        if (d.getFullYear() !== 2025) return null;
                        return { date: d.getTime(), close: +close, company: company?.trim() };
                    })
                    .filter(Boolean);
                setComparisonData(compData);

                const ohlc = rows
                    .map(r => {
                        const [date, open, high, low, close, , , company] = r.split(",");
                        if (company?.trim() !== selectedCompany) return null;
                        return { date: new Date(date).getTime(), open: +open, high: +high, low: +low, close: +close };
                    })
                    .filter(Boolean);
                setOhlcData(ohlc);
            });
    }, [selectedCompany]);

    const allCompaniesReport = {
        dataSource: { type: "csv", filename: "/data/maang_monthly.csv" },
        formats: [{ name: "twoDecimals", decimalPlaces: 2, thousandsSeparator: " ", decimalSeparator: "." }],
        slice: {
            rows: [{ uniqueName: "Company" }],
            columns: [{ uniqueName: "Date.Month" }, { uniqueName: "[Measures]" }],
            measures: [{ uniqueName: "Close", aggregation: "%differenceofrow", format: "twoDecimals" }],
            sorting: { row: { type: "asc", tuple: [], measure: { uniqueName: "Close", aggregation: "%differenceofrow" } } }
        },
        options: { grid: { showTotals: "off", showGrandTotals: "off" } },
        conditions: [{ formula: "#value < 0", measure: "Close", aggregation: "%differenceofrow", format: { backgroundColor: "#ff6361", color: "#000000" } }]
    };

    const selectedCompanyReport = {
        dataSource: { type: "csv", filename: `/data/${selectedCompany}_monthly.csv` },
        formats: [{ name: "twoDecimals", decimalPlaces: 2, thousandsSeparator: " ", decimalSeparator: "." }],
        slice: {
            rows: [{ uniqueName: "[Measures]" }],
            columns: [{ uniqueName: "Date.Year" }, { uniqueName: "Date.Month" }],
            measures: [
                { uniqueName: "High", aggregation: "max", format: "twoDecimals" },
                { uniqueName: "Low", aggregation: "min", format: "twoDecimals" }
            ]
        },
        options: { grid: { showTotals: "off" } }
    };


    const selectedCompanyChartReport = {
        dataSource: { type: "csv", filename: `/data/${selectedCompany}_monthly.csv` },
        slice: {
            filters: [{ uniqueName: "Company", filter: { members: [`Company.${selectedCompany}`] } }],
            rows: [{ uniqueName: "Date.Year" }, { uniqueName: "Date.Month" }],
            columns: [{ uniqueName: "[Measures]" }],
            measures: [{ uniqueName: "Volume", aggregation: "sum" }, { uniqueName: "Close", aggregation: "max" }]
        },
        options: { viewType: "charts", grid: { showTotals: "off" }, chart: { type: "column_line" } }
    };

    return (
        <div
            className={darkMode ? "dark-mode" : "light-mode"}
            style={{
                width: "100vw",
                minHeight: "100vh",
                padding: "20px",
                background: darkMode ? "#121212" : "#fff",
                color: darkMode ? "#eee" : "#000",
                transition: "all 0.3s ease"
            }}
        >

            <button
                onClick={() => setDarkMode(!darkMode)}
                style={{
                    position: "fixed",
                    top: 20,
                    right: 20,
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                    background: darkMode ? "#fff" : "#121212",
                    color: darkMode ? "#121212" : "#fff",
                    transition: "all 0.3s ease"
                }}
            >
                {darkMode ? "Light Mode" : "Dark Mode"}
            </button>


            < h2 style={sectionTitleStyle}>Monthly Close Price Change by Company (2025)</h2>
            <p style={sectionDescriptionStyle(darkMode)}>
                Displays the month-over-month percentage change in closing stock prices for all companies,
                enabling comparison of performance trends across 2025.
            </p>
            <div style={{width: "100%", height: "500px", marginBottom: "40px"}}>
                <FlexPivot report={allCompaniesReport} darkMode={darkMode}
                           keyProp={`all-${darkMode ? "dark" : "light"}`}/>
            </div>

            <h2 style={sectionTitleStyle}>Monthly Close Price Change Comparison Across Companies (2025)</h2>
            <p style={sectionDescriptionStyle(darkMode)}>
                Visual comparison of monthly changes in closing prices for each company during 2025.
            </p>
            <ComparisonLineChart data={comparisonData} darkMode={darkMode}/>


            <div style={{margin: "40px 0", display: "flex", gap: "10px", flexWrap: "wrap"}}>
                {companies.map(c => {
                    const color = COMPANY_COLOR_MAP[c];
                    const isActive = selectedCompany === c;

                    return (
                        <button
                            key={c}
                            onClick={() => setSelectedCompany(c)}
                            style={{
                                padding: "10px 18px",
                                fontWeight: "bold",
                                borderRadius: "999px",
                                cursor: "pointer",
                                border: `2px solid ${color}`,
                                background: isActive ? color : "transparent",
                                color: isActive ? "#ffffff" : color,
                                transition: "background-color 0.2s ease, color 0.2s ease",
                            }}
                            onMouseEnter={e => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = `${color}22`;
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                }
                            }}
                        >
                            {c}
                        </button>
                    );
                })}
            </div>

            <h2 style={sectionTitleStyle}>{selectedCompany} Monthly High and Low Price Summary</h2>
            <p style={sectionDescriptionStyle(darkMode)}>
                Monthly overview of the highest and lowest recorded stock prices for {selectedCompany}.
            </p>
            <div style={{width: "100%", height: "350px", marginBottom: "50px"}}>
                <FlexPivot
                    report={selectedCompanyReport}
                    darkMode={darkMode}
                    keyProp={`${selectedCompany}-${darkMode ? "dark" : "light"}-pivot`}
                />
            </div>

            <h2 style={sectionTitleStyle}>{selectedCompany} Trading Volume and Monthly Close Price</h2>
            <p style={sectionDescriptionStyle(darkMode)}>
                Displays total monthly trading volume alongside closing prices for {selectedCompany},
                helping identify relationships between market activity and price movement.
            </p>
            <div style={{width: "100%", height: "600px", marginBottom: "50px"}}>
                <FlexPivot
                    report={selectedCompanyChartReport}
                    darkMode={darkMode}
                    keyProp={`${selectedCompany}-${darkMode ? "dark" : "light"}-chart`}
                />
            </div>

            <h2 style={sectionTitleStyle}>{selectedCompany} Monthly OHLC Candlestick Chart</h2>
            <p style={sectionDescriptionStyle(darkMode)}>
                Candlestick visualization of monthly open, high, low, and close prices for {selectedCompany},
                highlighting price direction, volatility, and trend behavior.
            </p>
            <CandlestickChart data={ohlcData} darkMode={darkMode}/>
        </div>
    );
}

export default App;