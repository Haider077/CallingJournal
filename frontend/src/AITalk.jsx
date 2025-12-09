import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import ProfileMenu from './ProfileMenu'
import { getEntry, createEntry, updateEntry, sendMessage, getChatHistory, createChatSession } from './api'

const AITalk = ({ onBack, selectedDate, onLogout }) => {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('My Journal Entry')
  const [isSaving, setIsSaving] = useState(false)
  const [entryExists, setEntryExists] = useState(false)
  
  // Chat State
  const [chatSessionId, setChatSessionId] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [activeMobileTab, setActiveMobileTab] = useState('document') // 'document' or 'chat'
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (selectedDate) {
      fetchEntry()
      initializeChatSession()
    }
  }, [selectedDate])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchEntry = async () => {
    try {
      const entry = await getEntry(selectedDate)
      if (entry) {
        setContent(entry.content || '')
        setTitle(entry.title || 'My Journal Entry')
        setEntryExists(true)
      } else {
        setEntryExists(false)
        setContent('')
        setTitle('My Journal Entry')
      }
    } catch (error) {
      console.error("Failed to fetch entry:", error)
    }
  }

  const initializeChatSession = async () => {
    const storageKey = `chat_session_${selectedDate}`
    const storedSessionId = localStorage.getItem(storageKey)

    if (storedSessionId) {
      setChatSessionId(parseInt(storedSessionId))
      try {
        const history = await getChatHistory(storedSessionId)
        setChatMessages(history)
      } catch (error) {
        console.error("Failed to load chat history, creating new session", error)
        createNewSession(storageKey)
      }
    } else {
      createNewSession(storageKey)
    }
  }

  const createNewSession = async (storageKey) => {
    try {
      const session = await createChatSession(`Journal: ${selectedDate}`)
      setChatSessionId(session.id)
      localStorage.setItem(storageKey, session.id)
      
      // Add initial greeting
      setChatMessages([{
        role: 'model',
        content: "Hi! I'm here to help you write your journal entry. Feel free to ask for suggestions, improvements, or just chat about your day."
      }])
    } catch (error) {
      console.error("Failed to create chat session:", error)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const entryData = {
        date: selectedDate,
        title,
        content,
        mood: '😊',
        audio_url: null
      }

      if (entryExists) {
        await updateEntry(selectedDate, entryData)
      } else {
        await createEntry(entryData)
        setEntryExists(true)
      }
    } catch (error) {
      console.error("Failed to save entry:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!userInput.trim() || !chatSessionId) return

    const newMessage = { role: 'user', content: userInput }
    setChatMessages(prev => [...prev, newMessage])
    setUserInput('')
    setIsAiThinking(true)

    try {
      // Prepare context from current document
      const context = `Current Journal Entry:\nTitle: ${title}\nContent: ${content}`
      
      const response = await sendMessage(chatSessionId, newMessage.content, context)
      
      setChatMessages(prev => [...prev, { role: 'model', content: response.content }])
    } catch (error) {
      console.error("Failed to send message:", error)
      setChatMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again." }])
    } finally {
      setIsAiThinking(false)
    }
  }

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'New Entry'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          
          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden bg-slate-900/50 rounded-lg p-1 mx-2">
            <button
              onClick={() => setActiveMobileTab('document')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeMobileTab === 'document' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Document
            </button>
            <button
              onClick={() => setActiveMobileTab('chat')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeMobileTab === 'chat' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AI Chat
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <div className="text-slate-300 text-xs sm:text-sm hidden sm:block">
              {formatDisplayDate(selectedDate)}
            </div>
            <ProfileMenu onLogout={onLogout} />
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Panel: Document Editor */}
        <div className={`flex-1 flex-col border-r border-slate-700 bg-slate-50 overflow-y-auto transition-all duration-300 absolute inset-0 lg:relative lg:flex ${
          activeMobileTab === 'document' ? 'flex z-10' : 'hidden lg:flex'
        }`}>
          <div className="max-w-3xl mx-auto w-full p-4 sm:p-8 min-h-full">
            <input
              type="text"
              placeholder="Entry Title"
              className="text-2xl sm:text-3xl font-bold text-gray-900 w-full outline-none placeholder-gray-300 bg-transparent mb-4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your thoughts..."
              className="w-full h-[calc(100%-4rem)] text-base sm:text-lg text-gray-800 leading-relaxed outline-none resize-none placeholder-gray-300 bg-transparent"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </div>

        {/* Right Panel: Chat Interface */}
        <div className={`flex-col bg-slate-900 border-l border-slate-700 transition-all duration-300 absolute inset-0 lg:relative lg:flex lg:w-[400px] ${
          activeMobileTab === 'chat' ? 'flex z-10 w-full' : 'hidden lg:flex'
        }`}>
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-800/30">
            <h3 className="text-slate-200 font-medium flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              AI Collaborator
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              I can read your entry and help you write.
            </p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'model' ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isAiThinking && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-800 bg-slate-800/30">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask for help or suggestions..."
                className="w-full bg-slate-800 text-white rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={!userInput.trim() || isAiThinking}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AITalk