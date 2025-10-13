import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from './pages/Login'
import CreateNewParty from './pages/CreateNewParty'
import MainPartyData from './pages/MainPartyData'
import AddInvitors from './pages/AddInvitors'
import InvitorsPage from './pages/InvitorsPage'
import UpDateInvitor from './pages/UpDateInvitor'

export default function App() {
  return (
    <main>
      <Router>
        <Routes>
          <Route path='/' element={<Login />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/createnewparty' element={<CreateNewParty />}></Route>
          <Route path='/mainpartydata' element={<MainPartyData />}></Route>
          <Route path='/addinvitors' element={<AddInvitors />}></Route>
          <Route path='/invitorspage' element={<InvitorsPage />}></Route>
          <Route path='/updateinvitor' element={<UpDateInvitor />}></Route>
        </Routes>
      </Router>
    </main>
  )
}
