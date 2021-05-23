// @ts-nocheck
import * as React from 'react'
import styled from "styled-components"
import { useSelector } from "react-redux";
import { cutNumber } from "../../utils/global-functions"
import { cosmosSelector } from "../../modules/cosmosRest/slice"

import DataTable from 'react-data-table-component';
import axios from 'axios';

const columns = [
  {
    name: 'Rank',
    selector: 'rank',
    sortable: true,
    center: true,
    format: (row) => {
      if (row.accountAddress !== "YOU") {
        return <span className="rank">{row.rank}</span>
      } else {
        return <span className="myRank">{row.rank}</span>
      }
    }
    ,
    minWidth: "40px",
    maxWidth: "60px"
  },
  {
    name: 'Account',
    selector: 'accountAddress',
    right: true,
    // sortable: true,
    format: (row) => {
      if (row.accountAddress !== "YOU") {
        return row.accountAddress
      } else {
        return <span className="myRank">{row.accountAddress}</span>
      }
    },
    minWidth: "230px",
    maxWidth: "230px"
  },
  {
    name: 'Action Score',
    selector: 'actionScore',
    sortable: true,
    right: true,
    minWidth: "160px",
    maxWidth: "200px"
  },
  {
    name: 'Trading Score',
    selector: 'tradingScore',
    sortable: true,
    right: true,
    minWidth: "160px",
    maxWidth: "200px"
  },
  {
    name: 'Total Score',
    selector: 'totalScore',
    sortable: true,
    right: true,
    format: (row) => {
      return <span className="score">{row.totalScore}</span>
    },
    minWidth: "160px",
    maxWidth: "200px"
  },
];

//Styled-components
const Wrapper = styled.div`
width: 900px;
margin: 0 auto;
padding: 0 30px 40px 30px;

@media(max-width: 500px) {
  width: 100%;
}

/* border-radius: 20px; */
.table {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
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
    padding: 0;
  }

.rank {
  font-weight: bold;
  font-size: 16px;
}

.myRank {
  font-size: 18px;
  color:#F6743C;
  font-weight: bold;
}

.score {
  font-weight: bold;
  font-size: 16px;
}

.search {
  width: 100%;
  .input {
    width: 250px;
    outline:none;
    border: 1px solid #F6743C;
    background-color: black;
    color: #fff;
    font-weight: bold;
    padding: 8px 12px;
    border-radius: 20px;
    text-align: right;
     
    &::placeholder {
      color:rgba(255, 255, 255, 0.712);
      font-weight: normal;
    }
  }

  .searchButton {
    border: 1px solid #F6743C;
    padding: 0 12px;
    height: 33px;
    border-radius: 20px;
    margin-left: 8px;
    background-color: #F6743C;
    color:#fff;
    font-weight: bold;
    cursor: pointer;

    &:hover {
      border: 1px solid #fff;
    }
  }
}

.result {
  height: 20px;
  color: #fff;
}

#column-rank {
  padding-left: 30px;
}

.red {
  color: red;
}

.green {
  color: #1ce01c;
}
.rdt_TableBody {
  max-height: 100%;
}

.rdt_TableBody::-webkit-scrollbar {
    width: 10px;
  }
  .rdt_TableBody::-webkit-scrollbar-thumb {
    background-color: hsla(18.064516129032256, 91.17647058823533%, 60%, 0.829);
    border-radius: 10px;
    background-clip: padding-box;
    border: 2px solid transparent;
  }
  .rdt_TableBody::-webkit-scrollbar-track {
    background-color: hsla(24.878048780487806, 66.48648648648648%, 63.725490196078425%, 0.459);
    /* border-radius: 10px; */
    box-shadow: inset 0px 0px 5px rgba(78, 47, 11, 0.411);
  }
`


function Table() {
  const [tableData, setTableData] = React.useState([])
  const { userAddress } = useSelector(cosmosSelector.all);
  const [searchKeyword, setSearchKeyword] = React.useState('')
  const [searchResult, setSearchResult] = React.useState(null)
  // console.log(userAddress)
  // eslint-disable-next-line
  React.useEffect(async () => {
    let rankData = [];
    const response = await axios.get(`https://competition.bharvest.io:8081/scoreboard?address=${userAddress}`)
    response.data.accounts.forEach((account, index) => {
      const accountAddress = <div>{account.address.substr(0, 10)}...{account.address.substr(-5)} ({account.isValid ? <span className="green">Valid</span> : <span className="red">Invalid</span>})</div>
      const rank = account.ranking
      const actionScore = cutNumber(account.actionScore, 2)
      const tradingScore = cutNumber(account.tradingScore, 2)
      const totalScore = cutNumber(account.totalScore, 2)
      rankData.push({
        accountAddress: accountAddress,
        rank: rank,
        actionScore: actionScore,
        tradingScore: tradingScore,
        totalScore: totalScore
      })
    })
    if (response.data.me) {
      rankData.unshift({
        ...response.data.me,
        accountAddress: "YOU",
        rank: response.data.me.ranking,
        actionScore: cutNumber(response.data.me.actionScore, 2),
        tradingScore: cutNumber(response.data.me.tradingScore, 2),
        totalScore: cutNumber(response.data.me.totalScore, 2)
      })
    }

    setTableData(rankData)

    console.log("rankData : ", response.data)
  }, [userAddress])

  async function search() {
    if (searchKeyword) {
      const response = await axios.get(`https://competition.bharvest.io:8081/scoreboard/search?q=${searchKeyword}`)
      if (response.data.Account) {
        setSearchResult(response.data.Account)
      } else {
        setSearchResult("No")
      }

      console.log("resultData : ", response.data)
    } else {
      alert('Please, input nickname or address')
    }

  }

  return (
    <Wrapper>
      <div className="result">
        {searchResult ? searchResult !== "No" ? <div>Rank : {searchResult?.ranking} / Total Score : {searchResult.totalScore.toFixed(2)} / {searchResult.isValid}  {searchResult.isValid ? "Valid User 🤗" : "Invalid User 😂"}</div> : 'No Result  😂' : ''}
      </div>
      {tableData !== null ? <DataTable
        title={
          <div className="search">
            <input className="input" value={searchKeyword} onChange={(e) => { setSearchKeyword(e.target.value) }} type="text" placeholder="Search nickname or address" />
            <button onClick={() => {
              search()
            }} className="searchButton">Search</button>
          </div>

        }
        overflowY={true}
        columns={columns}
        className="table"
        data={tableData}
        responsive={true}
        fixedHeader={true}
        subHeaderAlign={"center"}
      /> : <div>No data</div>}

    </Wrapper>
  )
}

export default Table
