// @ts-nocheck
import * as React from 'react'
import styled from "styled-components"
import { cutNumber, uSliceUpper } from "../../utils/global-functions"
import { useHistory } from 'react-router-dom'

import Tooltip from "../../components/Tooltips/QuestionMarkTooltip"

import DataTable from 'react-data-table-component';
import axios from 'axios';



const columns = [
  {
    name: 'Pool',
    selector: 'poolName',
    minWidth: "120px",
    maxWidth: "140px"
  },
  {
    name: <div className="column-with-tooltip">Global Price &nbsp;<Tooltip text="USD price on coinmarketcap" /></div>,
    selector: 'xGlobalPrice',
    minWidth: "160px",
    format: row => `$${row.xGlobalPrice} ${row?.poolName?.split('-')[0]}`,
    right: true,
  },
  {
    name: <div className="column-with-tooltip">Global Price &nbsp;<Tooltip text="USD price on coinmarketcap" /></div>,
    selector: 'yGlobalPrice',
    minWidth: "160px",
    format: row => `$${row.yGlobalPrice} ${row?.poolName?.split('-')[1]}`,
    right: true,
  },
  {
    name: <div className="column-with-tooltip">Global Price Ratio &nbsp;<Tooltip text="Price ratio calculated from global price" /></div>,
    selector: 'globalRatio',
    right: true,
    minWidth: "210px"
  },
  {
    name: <div className="column-with-tooltip">Internal Price Ratio &nbsp;<Tooltip text="Pool price ratio" /></div>,
    selector: 'internalRatio',
    minWidth: "210px",
    right: true,
  },
  {
    name: <div className="column-with-tooltip">Arbitrage Chance &nbsp;<Tooltip text="Diversion of global ratio and internal ratio results in arbitrage chances" /></div>,
    selector: 'discrepancyRate',
    format: (row) => {


      let color = null
      let isBold = false
      if (row.discrepancyRate < 20) {
        color = '#fff'
      } else if (row.discrepancyRate < 30) {
        color = '#f7d895'
      } else if (row.discrepancyRate < 100) {
        color = '#fa7d08'
      } else {
        color = '#ff0000'
        isBold = true
      }

      return <span style={{ color: color, fontWeight: isBold ? '600' : '400' }}>{row.discrepancyRate + '%'}</span>

    },
    minWidth: "220px",
    sortable: true,
    right: true,
  },
];

//Styled-components
const Wrapper = styled.div`
width: 100%;
max-width: 1240px;
margin: 0 auto;

padding: 0 30px 60px 30px;
/* border-radius: 20px; */
.table {
  .rdt_Table {
    background-color: rgba(0, 0, 0, 0.5);
   
  }
  .rdt_TableHeader, .rdt_TableHead, .rdt_TableRow, .rdt_TableHeadRow{
    background-color: transparent;
    color: #fff !important;
  }

  .rdt_TableHead {
    border: 1px solid#F6743C;
    border-radius: 4px;
  }
  

  .rdt_TableCol  {
    color: #F6743C;
    font-weight: 600;
    font-size: 16px;
  }

  .rdt_TableCol_Sortable{
    color: #fff !important;
    span {
      color: #fff;
    }
  }
}

.rdt_TableHeader {
    background-color: transparent;
    color: #fff;
    font-size: 20px;
    font-weight: bold;
    padding-left: 0;
  }

.tradingButton {
  background-color: transparent;
  width: 64px;
  height: 28px;
  margin-left: 12px;
  border-radius: 4px;
  outline: none;
  border: 1px solid #f58352;
  cursor: pointer;
  color: #f58352;

  &:hover {
    border: 1px solid #e6b587;
    color:  #e6b587;
  }

}

.rdt_TableBody {
  max-height: 100%;
  height: 100%;
}

.rdt_TableRow:hover {
outline: none;
border: none;
background-color: hsla(36, 100%, 50%, 0.295) !important;
}

.column-with-tooltip {
  display: flex;
  align-items: center;
}
`




function Table() {
  const [tableData, setTableData] = React.useState([{ id: 1, title: 'Conan the Barbarian', year: '1982' }])
  const history = useHistory();
  // eslint-disable-next-line

  React.useEffect(() => {
    let intervalId = null
    getPriceData()
    intervalId = setInterval(() => {
      getPriceData()
    }, 10000)

    async function getPriceData() {
      let priceData = [];
      const response = await axios.get("https://competition.bharvest.io:8081/pools")
      response.data.pools.forEach((pool, index) => {
        const xCoinName = `${uSliceUpper(pool.reserveCoins[0].denom)}`
        const yCoinName = `${uSliceUpper(pool.reserveCoins[1].denom)}`
        const poolName = `${xCoinName}-${yCoinName}`

        const xGlobalPrice = Number(cutNumber(pool.reserveCoins[0].globalPrice * 1000000, 4))
        const yGlobalPrice = Number(cutNumber(pool.reserveCoins[1].globalPrice * 1000000, 4))

        const globalRatio = pool.reserveCoins[0].globalPrice / pool.reserveCoins[1].globalPrice
        const internalRatio = pool.reserveCoins[1].amount / pool.reserveCoins[0].amount

        const discrepancyRate = (internalRatio / globalRatio) - 1 > 0 ? (internalRatio / globalRatio) - 1 : ((internalRatio / globalRatio) - 1) * -1

        if (!isNaN(internalRatio)) {
          priceData.push({
            id: index,
            poolName: poolName,
            xGlobalPrice: xGlobalPrice,
            yGlobalPrice: yGlobalPrice,
            globalRatio: `${cutNumber(globalRatio, 4)} ${yCoinName} per ${xCoinName}`,
            internalRatio: `${cutNumber(internalRatio, 4)} ${yCoinName} per ${xCoinName}`,
            discrepancyRate: Number(`${cutNumber(discrepancyRate * 100, 2)}`),
            history: history
          })
        }
      })

      setTableData(priceData)
    }

    return () => clearInterval(intervalId)
  }, [history])

  return (
    <Wrapper>
      {tableData !== null ? <DataTable
        title="Pool Price"
        className="table"
        defaultSortField="discrepancyRate"
        defaultSortAsc={false}
        onRowClicked={(row) => {
          const pairA = row?.poolName?.split('-')[0].toLowerCase()
          const pairB = row?.poolName?.split('-')[1].toLowerCase()
          row.history.push(`/swap?from=${pairA}&to=${pairB}`)
        }}
        pointerOnHover={true}
        highlightOnHover={true}
        columns={columns}
        data={tableData}
        fixedHeader={true}
      /> : <div>No data</div>}
    </Wrapper>
  )
}

export default Table
