/**
 * Simple message/notification utility
 * Replacement for Element Plus ElMessage
 */

export type MessageType = 'success' | 'warning' | 'error' | 'info'

let messageContainer: HTMLDivElement | null = null

const createMessageContainer = () => {
  if (messageContainer) return messageContainer
  
  messageContainer = document.createElement('div')
  messageContainer.className = 'game-message-container'
  document.body.appendChild(messageContainer)
  return messageContainer
}

const showMessage = (message: string, type: MessageType = 'info', duration = 3000) => {
  const container = createMessageContainer()
  const messageEl = document.createElement('div')
  messageEl.className = `game-message game-message-${type}`
  messageEl.textContent = message
  
  container.appendChild(messageEl)
  
  // Trigger animation
  requestAnimationFrame(() => {
    messageEl.classList.add('game-message-show')
  })
  
  // Remove after duration
  setTimeout(() => {
    messageEl.classList.remove('game-message-show')
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl)
      }
    }, 300)
  }, duration)
}

export const message = {
  success: (msg: string, duration?: number) => showMessage(msg, 'success', duration),
  warning: (msg: string, duration?: number) => showMessage(msg, 'warning', duration),
  error: (msg: string, duration?: number) => showMessage(msg, 'error', duration),
  info: (msg: string, duration?: number) => showMessage(msg, 'info', duration)
}

// Add styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    .game-message-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    }
    
    .game-message {
      padding: 0.75rem 1.25rem;
      font-family: var(--game-font-family, 'Rajdhani', sans-serif);
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 8px;
      border: 2px solid;
      box-shadow: var(--game-shadow-base);
      background: var(--game-surface-bg-gradient);
      color: var(--game-text-primary);
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
      pointer-events: auto;
      min-width: 200px;
      max-width: 400px;
    }
    
    .game-message-show {
      opacity: 1;
      transform: translateX(0);
    }
    
    .game-message-success {
      border-color: var(--semantic-success);
      background: linear-gradient(135deg, color-mix(in srgb, var(--semantic-success) 20%, var(--game-surface-bg-start)) 0%, var(--game-surface-bg-end) 100%);
    }
    
    .game-message-warning {
      border-color: var(--semantic-warning);
      background: linear-gradient(135deg, color-mix(in srgb, var(--semantic-warning) 20%, var(--game-surface-bg-start)) 0%, var(--game-surface-bg-end) 100%);
    }
    
    .game-message-error {
      border-color: var(--semantic-danger);
      background: linear-gradient(135deg, color-mix(in srgb, var(--semantic-danger) 20%, var(--game-surface-bg-start)) 0%, var(--game-surface-bg-end) 100%);
    }
    
    .game-message-info {
      border-color: var(--semantic-info);
      background: linear-gradient(135deg, color-mix(in srgb, var(--semantic-info) 20%, var(--game-surface-bg-start)) 0%, var(--game-surface-bg-end) 100%);
    }
  `
  document.head.appendChild(style)
}
