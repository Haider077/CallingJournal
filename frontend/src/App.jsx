/**
 * App.jsx
 * Main application component with routing and authentication
 * 
 * Author: Haider Amin
 */

import { useState } from 'react'
import Landing from './Landing'
import ChatInterface from './ChatInterface'
import Calendar from './Calendar'
import AITalk from './AITalk'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState('chat') // 'chat', 'calendar', or 'aitalk'
  const [selectedDate, setSelectedDate] = useState(null)
  const [returnPage, setReturnPage] = useState('chat')

  const handleLogin = () => {
    setIsLoggedIn(true)
    setCurrentPage('chat')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentPage('chat')
  }

  const handleNavigateToCalendar = () => {
    setCurrentPage('calendar')
  }

  const handleBackToChat = () => {
    setCurrentPage('chat')
  }

  const handleOpenAITalk = (date) => {
    setSelectedDate(date)
    setReturnPage('calendar')
    setCurrentPage('aitalk')
  }

  const handleStartNewJournal = () => {
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
    setReturnPage('chat')
    setCurrentPage('aitalk')
  }

  const handleBackFromAITalk = () => {
    setCurrentPage(returnPage)
  }

  return (
    <>
      {!isLoggedIn ? (
        <Landing onLogin={handleLogin} />
      ) : currentPage === 'aitalk' ? (
        <AITalk onBack={handleBackFromAITalk} onLogout={handleLogout} selectedDate={selectedDate} />
      ) : currentPage === 'calendar' ? (
        <Calendar onOpenAITalk={handleOpenAITalk} onLogout={handleLogout} onBackToChat={handleBackToChat} />
      ) : (
        <ChatInterface 
          onNavigateToCalendar={handleNavigateToCalendar} 
          onLogout={handleLogout}
          onStartNewJournal={handleStartNewJournal}
        />
      )}
    </>
  )
}

export default App
