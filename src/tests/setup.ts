import { config } from '@vue/test-utils'
import { beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Глобальные настройки для Vue Test Utils
config.global.renderStubDefaultSlot = true
config.global.mocks = {
    $t: (key: string) => key
}
beforeEach(() => {
  config.global.stubs = {}
})