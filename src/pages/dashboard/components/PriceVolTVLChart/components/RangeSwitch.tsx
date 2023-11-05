import React, { useContext } from 'react'
import { PriceVolumeHistoryContext } from '../PriceVolumeTVL'

function RangeSwitch() {
  const { chartType, chartRange, setChartRange } = useContext(PriceVolumeHistoryContext)

  return (
    <>
      {chartType !== 'TVL' && (
        <>
          <button
            onClick={() => setChartRange('Day')}
            type="button"
            className={
              'py-1.5 px-3 text-xs font-semibold rounded-l-lg bg-neutral-100 dark:bg-neutral-700 ' +
              (chartRange === 'Day'
                ? ' cursor-default bg-neutral-300 dark:bg-cyan-500/20 text-black dark:text-cyan-200 font-semibold'
                : ' text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500')
            }
          >
            Day
          </button>
          <button
            onClick={() => setChartRange('Month')}
            type="button"
            className={
              'py-1.5 px-3 text-xs font-semibold bg-neutral-100 dark:bg-neutral-700' +
              (chartRange === 'Month'
                ? ' cursor-default bg-neutral-300 dark:bg-cyan-500/20 text-black dark:text-cyan-200 font-semibold'
                : ' text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500')
            }
          >
            Month
          </button>
          <button
            onClick={() => setChartRange('Year')}
            type="button"
            className={
              'py-1.5 px-3 text-xs font-semibold rounded-r-lg bg-neutral-100 dark:bg-neutral-700' +
              (chartRange === 'Year'
                ? ' cursor-default bg-neutral-300 dark:bg-cyan-500/20 text-black dark:text-cyan-200 font-semibold'
                : ' text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500')
            }
          >
            Year
          </button>
        </>
      )}

      {chartType === 'TVL' && (
        <>
          <button
            onClick={() => setChartRange('Year')}
            type="button"
            className={
              'py-1.5 px-3 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-900' +
              (chartRange === 'Year'
                ? ' cursor-default bg-neutral-300 dark:bg-cyan-500/20 text-black dark:text-cyan-200 font-semibold'
                : ' text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500')
            }
          >
            Year
          </button>
        </>
      )}
    </>
  )
}

export default RangeSwitch
