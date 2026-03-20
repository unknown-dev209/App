import React, { useState, useEffect, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom/client'
import {
  MessageCircle,
  Send,
  LogOut,
  User,
  Users,
  Search,
  MoreVertical,
  Phone,
  Video,
  Check,
  CheckCheck,
  Edit2,
  Trash2,
  X,
  Plus,
  ArrowLeft,
  Menu,
  Clock,
  Smile,
  Paperclip,
  ChevronDown,
  Settings,
  UserPlus,
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MessageSquare,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  logOut,
  onAuthChange,
  updateUserStatus,
  getAllUsers,
  subscribeToUsers,
  createDirectChat,
  createGroupChat,
  subscribeToUserChats,
  sendMessage,
  subscribeToMessages,
  markMessagesAsRead,
  editMessage,
  deleteMessage,
  updateTypingStatus,
  subscribeToTyping,
  formatTimestamp,
  formatMessageTime,
} from './firebase.js'

// ==================== CONTEXT ====================

const AuthContext = React.createContext(null)

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser)
      setLoading(false)
      if (currentUser) {
        updateUserStatus(currentUser.uid, true)
      }
    })

    return () => {
      if (user) {
        updateUserStatus(user.uid, false)
      }
      unsubscribe()
    }
  }, [])

  const value = {
    user,
    loading,
    setUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ==================== COMPONENTS ====================

// Loading Spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

// Button Component
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 disabled:text-gray-300',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-blue-300',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

// Input Component
const Input = ({ label, type = 'text', value, onChange, placeholder, error, icon: Icon }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon size={20} />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-200 ${
          Icon ? 'pl-10' : ''
        } ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'} focus:ring-2 outline-none`}
      />
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
)

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className={`relative bg-white rounded-xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-auto`}>
        {title && (
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

// ==================== AUTH PAGES ====================

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    const result = await signInWithGoogle()
    if (!result.success) {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let result
    if (isSignUp) {
      if (!displayName.trim()) {
        setError('Display name is required')
        setLoading(false)
        return
      }
      result = await signUpWithEmail(email, password, displayName)
    } else {
      result = await signInWithEmail(email, password)
    }

    if (!result.success) {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isSignUp ? 'Sign up to start chatting' : 'Sign in to continue chatting'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              icon={User}
            />
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            icon={Mail}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              icon={Lock}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : isSignUp ? (
              <>
                <UserPlus size={20} />
                Sign Up
              </>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="text-center mt-6 text-sm text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}

// ==================== CHAT COMPONENTS ====================

// Avatar Component
const Avatar = ({ src, name, size = 'md', online = false }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }

  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return (
    <div className="relative">
      <div
        className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold overflow-hidden`}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {online && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white online-status"></div>
      )}
    </div>
  )
}

// Typing Indicator Component
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-2 bg-gray-100 rounded-2xl rounded-tl-sm w-fit">
    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
  </div>
)

// Message Bubble Component
const MessageBubble = ({ message, isOwn, sender, onEdit, onDelete, onReply }) => {
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message.text)

  const handleEdit = () => {
    if (editText.trim() && editText !== message.text) {
      onEdit(message.id, editText)
    }
    setIsEditing(false)
  }

  const isRead = message.readBy?.length > 1

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && <Avatar src={sender?.photoURL} name={sender?.displayName} size="sm" />}

        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Reply reference */}
          {message.replyTo && (
            <div className="bg-gray-100 px-3 py-1 rounded-lg text-sm text-gray-600 mb-1 max-w-full truncate">
              Replying to: {message.replyTo.text?.substring(0, 50)}...
            </div>
          )}

          {/* Message content */}
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEdit()
                  if (e.key === 'Escape') {
                    setIsEditing(false)
                    setEditText(message.text)
                  }
                }}
                className="px-3 py-2 border rounded-lg text-sm"
                autoFocus
              />
              <Button size="sm" onClick={handleEdit}>
                <Check size={16} />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => {
                setIsEditing(false)
                setEditText(message.text)
              }}>
                <X size={16} />
              </Button>
            </div>
          ) : (
            <div
              className={`px-4 py-2.5 rounded-2xl message-enter ${
                isOwn
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-gray-100 text-gray-800 rounded-tl-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
              <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <span className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                  {formatMessageTime(message.createdAt)}
                </span>
                {message.edited && (
                  <span className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                    (edited)
                  </span>
                )}
                {isOwn && (
                  <span className="text-blue-200">
                    {isRead ? <CheckCheck size={14} /> : <Check size={14} />}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && !isEditing && (
            <div className={`flex gap-1 mt-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              <button
                onClick={() => onReply(message)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Reply"
              >
                <MessageSquare size={14} className="text-gray-500" />
              </button>
              {isOwn && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={14} className="text-gray-500" />
                  </button>
                  <button
                    onClick={() => onDelete(message.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Chat List Item Component
const ChatListItem = ({ chat, currentUser, isActive, onClick, users }) => {
  const getChatName = () => {
    if (chat.type === 'group') {
      return chat.name
    }
    const otherParticipant = chat.participants?.find(p => p !== currentUser?.uid)
    const otherUser = users.find(u => u.uid === otherParticipant)
    return otherUser?.displayName || 'Unknown User'
  }

  const getChatAvatar = () => {
    if (chat.type === 'group') {
      return null
    }
    const otherParticipant = chat.participants?.find(p => p !== currentUser?.uid)
    const otherUser = users.find(u => u.uid === otherParticipant)
    return otherUser?.photoURL
  }

  const getOnlineStatus = () => {
    if (chat.type === 'group') return false
    const otherParticipant = chat.participants?.find(p => p !== currentUser?.uid)
    const otherUser = users.find(u => u.uid === otherParticipant)
    return otherUser?.online || false
  }

  const unreadCount = chat.unreadCount?.[currentUser?.uid] || 0

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
        isActive ? 'bg-blue-50 border-r-2 border-blue-600' : ''
      }`}
    >
      <Avatar
        src={getChatAvatar()}
        name={getChatName()}
        online={getOnlineStatus()}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 truncate">{getChatName()}</h4>
          {chat.lastMessage && (
            <span className="text-xs text-gray-500">
              {formatTimestamp(chat.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 truncate">
            {chat.lastMessage ? (
              <>
                {chat.lastMessage.senderId === currentUser?.uid && 'You: '}
                {chat.lastMessage.text}
              </>
            ) : (
              'No messages yet'
            )}
          </p>
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// New Chat Modal
const NewChatModal = ({ isOpen, onClose, currentUser, onCreateChat, users }) => {
  const [activeTab, setActiveTab] = useState('direct')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [groupName, setGroupName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = users.filter(user =>
    user.uid !== currentUser?.uid &&
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = async () => {
    if (activeTab === 'direct' && selectedUsers.length === 1) {
      await onCreateChat('direct', selectedUsers[0])
    } else if (activeTab === 'group' && selectedUsers.length >= 1 && groupName.trim()) {
      await onCreateChat('group', selectedUsers, groupName)
    }
    onClose()
    setSelectedUsers([])
    setGroupName('')
    setSearchQuery('')
  }

  const toggleUserSelection = (userId) => {
    if (activeTab === 'direct') {
      setSelectedUsers([userId])
    } else {
      setSelectedUsers(prev =>
        prev.includes(userId)
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      )
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Chat" size="md">
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab('direct')
              setSelectedUsers([])
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'direct'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <User size={18} className="inline mr-2" />
            Direct Message
          </button>
          <button
            onClick={() => {
              setActiveTab('group')
              setSelectedUsers([])
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'group'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users size={18} className="inline mr-2" />
            Group Chat
          </button>
        </div>

        {activeTab === 'group' && (
          <Input
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {activeTab === 'direct' ? 'Select User' : 'Select Members'}
          </label>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No users found</div>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.uid}
                  onClick={() => toggleUserSelection(user.uid)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedUsers.includes(user.uid) ? 'bg-blue-50' : ''
                  }`}
                >
                  {activeTab === 'group' && (
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedUsers.includes(user.uid)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedUsers.includes(user.uid) && <Check size={14} className="text-white" />}
                    </div>
                  )}
                  {activeTab === 'direct' && selectedUsers.includes(user.uid) && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                  <Avatar src={user.photoURL} name={user.displayName} size="sm" online={user.online} />
                  <span className="flex-1 font-medium">{user.displayName}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              selectedUsers.length === 0 ||
              (activeTab === 'group' && !groupName.trim())
            }
            className="flex-1"
          >
            Create Chat
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// Chat Header Component
const ChatHeader = ({ chat, currentUser, users, onBack, onShowInfo }) => {
  const getChatInfo = () => {
    if (chat.type === 'group') {
      return {
        name: chat.name,
        avatar: null,
        subtitle: `${chat.participants?.length || 0} members`,
        online: false,
      }
    }
    const otherParticipant = chat.participants?.find(p => p !== currentUser?.uid)
    const otherUser = users.find(u => u.uid === otherParticipant)
    return {
      name: otherUser?.displayName || 'Unknown User',
      avatar: otherUser?.photoURL,
      subtitle: otherUser?.online ? 'Online' : 'Offline',
      online: otherUser?.online || false,
    }
  }

  const info = getChatInfo()

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <Avatar src={info.avatar} name={info.name} online={info.online} />
        <div>
          <h3 className="font-semibold text-gray-900">{info.name}</h3>
          <p className="text-sm text-gray-500">{info.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Phone size={20} className="text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Video size={20} className="text-gray-600" />
        </button>
        <button
          onClick={onShowInfo}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical size={20} className="text-gray-600" />
        </button>
      </div>
    </div>
  )
}

// Message Input Component
const MessageInput = ({ onSend, onTyping, replyTo, onCancelReply }) => {
  const [message, setMessage] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [message])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      onSend(message.trim())
      setMessage('')
      onTyping(false)
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleChange = (e) => {
    setMessage(e.target.value)
    onTyping(e.target.value.length > 0)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="bg-white border-t p-4">
      {replyTo && (
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg mb-2">
          <div className="flex-1 text-sm text-gray-600 truncate">
            Replying to: {replyTo.text?.substring(0, 50)}...
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <button
          type="button"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Paperclip size={20} className="text-gray-500" />
        </button>
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-2xl resize-none max-h-32 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Smile size={20} className="text-gray-500" />
          </button>
        </div>
        <button
          type="submit"
          disabled={!message.trim()}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}

// Sidebar Component
const Sidebar = ({ currentUser, chats, activeChat, onSelectChat, onNewChat, users, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)

  const filteredChats = chats.filter(chat => {
    const chatName = chat.type === 'group'
      ? chat.name
      : users.find(u => u.uid === chat.participants?.find(p => p !== currentUser?.uid))?.displayName
    return chatName?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="w-full h-full flex flex-col bg-white border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Avatar
                src={currentUser?.photoURL}
                name={currentUser?.displayName}
                size="sm"
              />
              <ChevronDown size={16} className="text-gray-500" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="font-medium text-gray-900">{currentUser?.displayName}</p>
                  <p className="text-sm text-gray-500">{currentUser?.email}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-200 focus:bg-white outline-none transition-all"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageCircle size={48} className="mb-4 opacity-50" />
            <p>No chats yet</p>
            <p className="text-sm">Start a new conversation!</p>
          </div>
        ) : (
          filteredChats.map(chat => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              currentUser={currentUser}
              isActive={activeChat?.id === chat.id}
              onClick={() => onSelectChat(chat)}
              users={users}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Chat Area Component
const ChatArea = ({ chat, currentUser, users, onBack }) => {
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [replyTo, setReplyTo] = useState(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    if (!chat?.id) return

    const unsubscribeMessages = subscribeToMessages(chat.id, (newMessages) => {
      setMessages(newMessages)
    })

    const unsubscribeTyping = subscribeToTyping(chat.id, (users) => {
      setTypingUsers(users.filter(uid => uid !== currentUser?.uid))
    })

    // Mark messages as read when opening chat
    markMessagesAsRead(chat.id, currentUser?.uid)

    return () => {
      unsubscribeMessages()
      unsubscribeTyping()
    }
  }, [chat?.id, currentUser?.uid])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])

  const handleSendMessage = async (text) => {
    if (!chat?.id || !currentUser?.uid) return
    await sendMessage(chat.id, currentUser.uid, text, replyTo)
    setReplyTo(null)
  }

  const handleTyping = (isTyping) => {
    if (!chat?.id || !currentUser?.uid) return

    updateTypingStatus(chat.id, currentUser.uid, isTyping)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        updateTypingStatus(chat.id, currentUser.uid, false)
      }, 3000)
    }
  }

  const handleEditMessage = async (messageId, newText) => {
    await editMessage(chat.id, messageId, newText)
  }

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(chat.id, messageId)
    }
  }

  const handleReply = (message) => {
    setReplyTo({
      id: message.id,
      text: message.text,
      senderId: message.senderId,
    })
  }

  const getSender = (senderId) => {
    return users.find(u => u.uid === senderId)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ChatHeader
        chat={chat}
        currentUser={currentUser}
        users={users}
        onBack={onBack}
        onShowInfo={() => {}}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <MessageCircle size={40} className="text-gray-400" />
            </div>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Send a message to start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const showDate = index === 0 ||
              new Date(messages[index - 1].createdAt?.toDate?.() || messages[index - 1].createdAt).toDateString() !==
              new Date(message.createdAt?.toDate?.() || message.createdAt).toDateString()

            return (
              <React.Fragment key={message.id}>
                {showDate && (
                  <div className="flex justify-center">
                    <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {new Date(message.createdAt?.toDate?.() || message.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={message}
                  isOwn={message.senderId === currentUser?.uid}
                  sender={getSender(message.senderId)}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                  onReply={handleReply}
                />
              </React.Fragment>
            )
          })
        )}

        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <TypingIndicator />
            <span className="text-sm text-gray-500">
              {typingUsers.length === 1
                ? `${getSender(typingUsers[0])?.displayName || 'Someone'} is typing...`
                : 'Several people are typing...'}
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSend={handleSendMessage}
        onTyping={handleTyping}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  )
}

// ==================== MAIN APP ====================

const App = () => {
  const { user, loading } = useAuth()
  const [chats, setChats] = useState([])
  const [users, setUsers] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)

  useEffect(() => {
    if (!user) return

    const unsubscribeChats = subscribeToUserChats(user.uid, (userChats) => {
      setChats(userChats)
    })

    const unsubscribeUsers = subscribeToUsers((allUsers) => {
      setUsers(allUsers)
    })

    return () => {
      unsubscribeChats()
      unsubscribeUsers()
    }
  }, [user])

  const handleCreateChat = async (type, selectedUsers, groupName = '') => {
    if (type === 'direct') {
      await createDirectChat(user.uid, selectedUsers)
    } else {
      await createGroupChat(user.uid, groupName, selectedUsers)
    }
  }

  const handleSelectChat = (chat) => {
    setActiveChat(chat)
    setShowMobileChat(true)
    markMessagesAsRead(chat.id, user.uid)
  }

  const handleLogout = async () => {
    await logOut()
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar - Desktop always visible, Mobile hidden when chat open */}
      <div className={`${showMobileChat ? 'hidden' : 'flex'} lg:flex w-full lg:w-80 flex-shrink-0 h-full`}>
        <Sidebar
          currentUser={user}
          chats={chats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onNewChat={() => setShowNewChatModal(true)}
          users={users}
          onLogout={handleLogout}
        />
      </div>

      {/* Chat Area - Desktop always visible (if selected), Mobile conditional */}
      <div className={`${showMobileChat ? 'flex' : 'hidden'} lg:flex flex-1 h-full`}>
        {activeChat ? (
          <ChatArea
            chat={activeChat}
            currentUser={user}
            users={users}
            onBack={() => setShowMobileChat(false)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <MessageCircle size={48} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a chat</h3>
            <p className="text-gray-500">Choose a conversation to start messaging</p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        currentUser={user}
        onCreateChat={handleCreateChat}
        users={users}
      />
    </div>
  )
}

// ==================== RENDER ====================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
