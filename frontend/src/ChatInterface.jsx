/**
 * ChatInterface.jsx
 * Main chat interface with AI assistant for journaling
 * 
 * Author: Haider Amin
 * 
 * This component provides:
 * - AI chatbot interface for conversational journaling
 * - Header with AI insights and positive reinforcement
 * - Left sidebar with chat history organized by date
 * - Navigation to calendar view
 * - Message input with send functionality
 */

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import ProfileMenu from './ProfileMenu'
import { sendMessage, getChatHistory, getChatSessions, createChatSession, deleteChatSession } from './api'

const ChatInterface = ({ onNavigateToCalendar, onLogout, onStartNewJournal }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    if (currentSessionId) {
      loadChatHistory(currentSessionId)
    } else if (sessions.length > 0) {
      // Select first session if none selected
      setCurrentSessionId(sessions[0].id)
    }
  }, [currentSessionId, sessions])

  const loadSessions = async () => {
    try {
      const fetchedSessions = await getChatSessions()
      setSessions(fetchedSessions)
      if (fetchedSessions.length > 0 && !currentSessionId) {
        setCurrentSessionId(fetchedSessions[0].id)
      }
    } catch (error) {
      console.error("Failed to load chat sessions", error)
    }
  }

  const handleNewChat = async () => {
    try {
      const newSession = await createChatSession()
      setSessions([newSession, ...sessions])
      setCurrentSessionId(newSession.id)
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm your AI journaling assistant. How are you feeling today? Would you like to reflect on something?",
        timestamp: new Date(),
        showSuggestions: true
      }])
    } catch (error) {
      console.error("Failed to create new chat", error)
    }
  }

  const handleDeleteChat = async (e, sessionId) => {
    e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        await deleteChatSession(sessionId)
        const updatedSessions = sessions.filter(s => s.id !== sessionId)
        setSessions(updatedSessions)
        if (currentSessionId === sessionId) {
          setCurrentSessionId(updatedSessions.length > 0 ? updatedSessions[0].id : null)
          if (updatedSessions.length === 0) {
            setMessages([])
          }
        }
      } catch (error) {
        console.error("Failed to delete chat", error)
      }
    }
  }

  const loadChatHistory = async (sessionId) => {
    try {
      const history = await getChatHistory(sessionId)
      const formattedMessages = history.map(msg => ({
        id: msg.id,
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content,
        timestamp: new Date(msg.timestamp)
      }))
      
      if (formattedMessages.length === 0) {
          setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: "Hello! I'm your AI journaling assistant. How are you feeling today? Would you like to reflect on something?",
            timestamp: new Date(),
            showSuggestions: true
          }])
      } else {
          setMessages(formattedMessages)
      }
    } catch (error) {
      console.error("Failed to load chat history", error)
    }
  }

  // Group sessions by date (simplified for now)
  const groupedSessions = {
    'Recent': sessions
  }

  // Dummy AI insights
  const aiInsights = [
    "You've been on fire practicing the piano! Keep it going! 🎹",
    "Your consistency this week is amazing! 7 days in a row! 🌟",
    "I notice you're reflecting more on gratitude lately. Beautiful! 💫",
    "Your mindfulness practice is really developing! Keep it up! 🧘"
  ]

  const [currentInsight] = useState(aiInsights[0])

  // Suggestion buttons that appear after AI messages
  const suggestions = [
    "Start a new journal",
    "How was my day?",
    "Reflect on my goals",
    "Practice gratitude"
  ]

  const handleSuggestionClick = (suggestion) => {
    // Special handling for "Start a new journal"
    if (suggestion === "Start a new journal") {
      onStartNewJournal && onStartNewJournal()
      return
    }
    setInputMessage(suggestion)
  }

  const handleSendMessage = async (customMessage = null) => {
    const messageToSend = (typeof customMessage === 'string') ? customMessage : inputMessage
    if (!messageToSend || messageToSend.trim() === '' || isLoading) return

    // Create session if none exists
    let activeSessionId = currentSessionId
    if (!activeSessionId) {
      try {
        const newSession = await createChatSession()
        setSessions([newSession, ...sessions])
        setCurrentSessionId(newSession.id)
        activeSessionId = newSession.id
      } catch (error) {
        console.error("Failed to create session", error)
        return
      }
    }

    const newMessage = {
      id: Date.now(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await sendMessage(activeSessionId, messageToSend)
      const aiMessage = {
        id: response.id,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(response.timestamp)
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error("Failed to send message", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-screen bg-linear-to-br from-slate-900 via-blue-900 to-purple-900 flex overflow-hidden">
      {/* Left Sidebar - Chat History */}
      <div className={`bg-slate-800 border-r border-purple-700/30 flex flex-col transition-all duration-300 ${isMenuCollapsed ? 'w-16' : 'w-80'}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-purple-700/30">
          {!isMenuCollapsed ? (
            <>
              <h2 className="text-xl font-light text-white mb-4">Journal Chats</h2>
              <button 
                onClick={handleNewChat}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 px-4 rounded-md transition-colors font-light flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                New Chat
              </button>
            </>
          ) : (
            <button 
              onClick={handleNewChat}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-md transition-colors"
            >
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-4">
          {!isMenuCollapsed ? (
            sessions.length > 0 ? (
              <div className="mb-6">
                <h3 className="text-xs font-light text-gray-400 uppercase mb-2 px-2">
                  Recent Chats
                </h3>
                <div className="space-y-1">
                  {sessions.map((session) => (
                    <div key={session.id} className="group relative">
                      <button
                        onClick={() => setCurrentSessionId(session.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
                          currentSessionId === session.id
                            ? 'bg-purple-600/20 text-white border border-purple-500/30'
                            : 'text-gray-300 hover:bg-slate-700'
                        }`}
                      >
                        <div className="font-light text-sm truncate pr-6">{session.title}</div>
                        <div className="text-xs font-light text-gray-400 mt-0.5">
                          {new Date(session.updated_at || session.created_at).toLocaleDateString()}
                        </div>
                      </button>
                      <button
                        onClick={(e) => handleDeleteChat(e, session.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-opacity p-1"
                        title="Delete chat"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 font-light text-sm mt-10">
                No chats yet. Start a new one!
              </div>
            )
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setCurrentSessionId(session.id)}
                  className={`w-full p-2 rounded-md transition-colors ${
                    currentSessionId === session.id
                      ? 'bg-purple-600/20 text-white'
                      : 'text-gray-300 hover:bg-slate-700'
                  }`}
                  title={session.title}
                >
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Calendar Navigation & Toggle */}
        <div className="p-4 border-t border-purple-700/30 space-y-2">
          {!isMenuCollapsed ? (
            <>
              <button
                onClick={onNavigateToCalendar}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2.5 px-4 rounded-md transition-colors font-light flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar View
              </button>
              <button
                onClick={() => setIsMenuCollapsed(true)}
                className="w-full text-gray-400 hover:text-white py-2 text-sm font-light flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                Collapse
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onNavigateToCalendar}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-md transition-colors"
                title="Calendar View"
              >
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setIsMenuCollapsed(false)}
                className="w-full text-gray-400 hover:text-white p-2 transition-colors"
                title="Expand"
              >
                <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with AI Insight */}
        <div className="bg-slate-900/50 backdrop-blur-sm border-b border-purple-700/30 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xs font-light text-purple-300 uppercase">AI Insight</div>
                <div className="text-sm font-light text-white">{currentInsight}</div>
              </div>
            </div>
            <ProfileMenu onLogout={onLogout} />
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div key={message.id}>
                <div
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-gray-200 border border-purple-700/30'
                    }`}
                  >
                    <div className="text-sm font-light leading-relaxed">
                      {message.role === 'user' ? (
                        message.content
                      ) : (
                        <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-purple-700/30">
                          <ReactMarkdown>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-light opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                
                {/* Suggestion Buttons - show after assistant messages */}
                {message.role === 'assistant' && message.showSuggestions && index === messages.length - 1 && (
                  <div className="flex flex-wrap gap-2 mt-3 ml-2">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white px-4 py-2 rounded-full text-sm font-light border border-purple-700/30 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-gray-200 border border-purple-700/30 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-xs font-light text-gray-400">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-slate-900/50 backdrop-blur-sm border-t border-purple-700/30 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 bg-slate-800 border border-purple-700/30 rounded-lg overflow-hidden">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts, feelings, or reflections..."
                  className="w-full bg-transparent text-white font-light px-4 py-3 outline-none resize-none"
                  rows="3"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={inputMessage.trim() === ''}
                className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <button className="text-gray-400 hover:text-white transition-colors font-light text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
                Voice Input
              </button>
              <span className="text-xs font-light text-gray-500">
                Press Enter to send, Shift+Enter for new line
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface