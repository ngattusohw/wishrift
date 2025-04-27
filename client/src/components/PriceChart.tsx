import { useEffect, useRef } from "react";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, registerables } from "chart.js";

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, ...registerables);

interface PriceChartProps {
  data: { price: number; date: Date }[];
  height?: number;
  lineColor?: string;
}

const PriceChart = ({ data, height = 80, lineColor }: PriceChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Get the chartColor based on price trend
    let chartColor = lineColor;
    if (!chartColor) {
      if (data.length >= 2) {
        const firstPrice = data[0].price;
        const lastPrice = data[data.length - 1].price;
        if (lastPrice < firstPrice) {
          chartColor = '#2ecc71'; // green for price drop
        } else if (lastPrice > firstPrice) {
          chartColor = '#e74c3c'; // red for price increase
        } else {
          chartColor = '#95a5a6'; // gray for stable price
        }
      } else {
        chartColor = '#95a5a6'; // default gray
      }
    }

    // Sort data by date
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Format data for Chart.js
    const labels = sortedData.map(d => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    const prices = sortedData.map(d => d.price / 100); // Convert cents to dollars

    // Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data: prices,
            borderColor: chartColor,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 3,
            tension: 0.2,
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: (context) => {
                  return `$${context.raw}`;
                }
              }
            }
          },
          scales: {
            x: {
              display: false
            },
            y: {
              display: false,
              min: Math.min(...prices) * 0.95,
              max: Math.max(...prices) * 1.05
            }
          },
          elements: {
            line: {
              tension: 0.2
            }
          }
        }
      });
    }

    // Cleanup chart on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, height, lineColor]);

  return (
    <div style={{ height: `${height}px` }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default PriceChart;
