/**
 * Shared logging via loglevel
 *
 * Named loggers allow per-area level control. Default level is 'warn' so
 * per-frame / progress logs are quiet. In browser console:
 *   log.getLogger('ide-messages').setLevel('debug')  // verbose worker messages
 *   log.getLogger('screen').setLevel('debug')       // Screen render/sprite trace
 */

import log from 'loglevel'

const defaultLevel: log.LogLevelDesc = 'warn'
log.setDefaultLevel(defaultLevel)

/** IDE worker message handling (PROGRESS, ANIMATION_COMMAND, etc.). Use debug for verbose. */
export const logIdeMessages = log.getLogger('ide-messages')
logIdeMessages.setDefaultLevel(defaultLevel)

/** Screen component (render, sprite build, buffer-only). Use debug for first-run trace. */
export const logScreen = log.getLogger('screen')
logScreen.setDefaultLevel(defaultLevel)

export { log }
