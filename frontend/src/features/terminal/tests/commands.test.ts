import 'vitest'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createCommandHandlers, HELP_LINES } from '../commands'
import {
  createOption,
  deleteOption,
  getLockState,
  getOptions,
  getStats,
  setLockState,
  vote,
} from '../../../api'

vi.mock('../../../api', () => ({
  getOptions: vi.fn(),
  createOption: vi.fn(),
  vote: vi.fn(),
  deleteOption: vi.fn(),
  getStats: vi.fn(),
  getLockState: vi.fn(),
  setLockState: vi.fn(),
  resetSession: vi.fn(),
  getHealth: vi.fn(),
}))

describe('createCommandHandlers', () => {
  const pushOutput = vi.fn()
  const clearTerminal = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function buildHandlers() {
    return createCommandHandlers({ pushOutput, clearTerminal })
  }

  it('returns false for unknown commands', async () => {
    const handlers = buildHandlers()

    const result = await handlers.run('does-not-exist', [])

    expect(result).toBe(false)
    expect(pushOutput).not.toHaveBeenCalled()
    expect(clearTerminal).not.toHaveBeenCalled()
  })

  it('prints help text through pushOutput', async () => {
    const handlers = buildHandlers()

    const handled = await handlers.run('help', [])

    expect(handled).toBe(true)
    expect(pushOutput).toHaveBeenCalledWith('info', HELP_LINES)
  })

  it('lists options using formatted output', async () => {
    const handlers = buildHandlers()
    vi.mocked(getOptions).mockResolvedValue([
      {
        id: 1,
        name: 'Pizza Palace',
        link: 'https://pizza.example',
        votes: 2,
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ])

    const handled = await handlers.run('list', [])

    expect(handled).toBe(true)
    expect(pushOutput).toHaveBeenCalledWith(
      'success',
      expect.arrayContaining([
        '#  id  name / votes',
        '01  id:1  Pizza Palace  [votes: +2]',
        '    link: https://pizza.example',
      ])
    )
  })

  it('delegates to clear when clear command runs', async () => {
    const handlers = buildHandlers()

    const handled = await handlers.run('clear', [])

    expect(handled).toBe(true)
    expect(clearTerminal).toHaveBeenCalledTimes(1)
    expect(pushOutput).not.toHaveBeenCalled()
  })

  it('deletes an option when delete command succeeds', async () => {
    const handlers = buildHandlers()

    const handled = await handlers.run('delete', ['4'])

    expect(handled).toBe(true)
    expect(deleteOption).toHaveBeenCalledWith(4)
    expect(pushOutput).toHaveBeenCalledWith('success', ['Deleted option 4.'])
  })

  it('validates delete command arguments', async () => {
    const handlers = buildHandlers()

    await expect(handlers.run('delete', ['abc'])).rejects.toThrow(
      'Option id must be a positive integer'
    )
    expect(deleteOption).not.toHaveBeenCalled()
    expect(pushOutput).not.toHaveBeenCalled()
  })

  it('creates options through the add command', async () => {
    const handlers = buildHandlers()
    vi.mocked(createOption).mockResolvedValue({
      id: 42,
      name: 'Taco Town',
      link: 'https://tacos.example',
      votes: 0,
      createdAt: '2025-01-01T00:00:00.000Z',
    })

    const handled = await handlers.run('add', ['Taco Town', 'https://tacos.example'])

    expect(handled).toBe(true)
    expect(createOption).toHaveBeenCalledWith('Taco Town', 'https://tacos.example')
    expect(pushOutput).toHaveBeenCalledWith('success', [
      'Added option: Taco Town',
      'id: 42',
      'link: https://tacos.example',
    ])
  })

  it('rejects invalid add usage', async () => {
    const handlers = buildHandlers()

    await expect(handlers.run('add', ['only-name'])).rejects.toThrow('Usage: add "name" <link>')
    expect(createOption).not.toHaveBeenCalled()
    expect(pushOutput).not.toHaveBeenCalled()
  })

  it('records votes with canonical prompts', async () => {
    const handlers = buildHandlers()
    vi.mocked(vote).mockResolvedValue({
      id: 1,
      name: 'Sushi Spot',
      link: 'https://sushi.example',
      votes: 7,
      createdAt: '2025-01-01T00:00:00.000Z',
    })

    const handled = await handlers.run('vote', ['1', 'up'])

    expect(handled).toBe(true)
    expect(vote).toHaveBeenCalledWith(1, 1)
    expect(pushOutput).toHaveBeenCalledWith('success', [
      'Recorded vote +1 for Sushi Spot.',
      'New total votes: 7',
    ])
  })

  it('validates vote delta', async () => {
    const handlers = buildHandlers()

    await expect(handlers.run('vote', ['3', 'invalid'])).rejects.toThrow(
      'Delta must be +1, -1, up, or down'
    )
    expect(vote).not.toHaveBeenCalled()
    expect(pushOutput).not.toHaveBeenCalled()
  })

  it('reports lock status when requested', async () => {
    const handlers = buildHandlers()
    vi.mocked(getLockState).mockResolvedValue({ locked: true, lockedAt: '2025-01-01T12:30:00.000Z' })

    const handled = await handlers.run('lock', ['status'])

    expect(handled).toBe(true)
    expect(getLockState).toHaveBeenCalledTimes(1)
    expect(pushOutput).toHaveBeenCalledWith('info', [
      'Voting is LOCKED. Locked at: 2025-01-01T12:30:00.000Z',
    ])
  })

  it('locks voting and reports confirmation', async () => {
    const handlers = buildHandlers()
    vi.mocked(setLockState).mockResolvedValue({ locked: true, lockedAt: '2025-01-01T12:45:00.000Z' })

    const handled = await handlers.run('lock', ['on'])

    expect(handled).toBe(true)
    expect(setLockState).toHaveBeenCalledWith(true)
    expect(pushOutput).toHaveBeenCalledWith('success', [
      'Voting locked at 2025-01-01T12:45:00.000Z. No new votes allowed.',
    ])
  })

  it('rejects unknown lock subcommands', async () => {
    const handlers = buildHandlers()

    await expect(handlers.run('lock', ['maybe'])).rejects.toThrow('Usage: lock status|on|off')
    expect(setLockState).not.toHaveBeenCalled()
    expect(pushOutput).not.toHaveBeenCalled()
  })

  it('outputs stats with aggregated information', async () => {
    const handlers = buildHandlers()
    vi.mocked(getStats).mockResolvedValue({
      totalOptions: 3,
      totalVotes: 10,
      averageVotes: 3.33,
      mostPopularOption: {
        id: 7,
        name: 'Burger Barn',
        link: 'https://burgers.example',
        votes: 5,
        createdAt: '2025-01-01T10:00:00.000Z',
      },
    })

    const handled = await handlers.run('stats', [])

    expect(handled).toBe(true)
    expect(getStats).toHaveBeenCalledTimes(1)
    expect(pushOutput).toHaveBeenCalledWith('info', expect.arrayContaining([
      'Total options: 3',
      'Total votes: 10',
      'Average votes per option: 3.33',
      'Most popular option:',
      '  Burger Barn (5 votes)',
      '  id: 7',
    ]))
  })

  it('selects a random option when available', async () => {
    const handlers = buildHandlers()
    vi.mocked(getOptions).mockResolvedValue([
      { id: 1, name: 'A', link: '', votes: 0, createdAt: '2025-01-01T00:00:00.000Z' },
      { id: 2, name: 'B', link: '', votes: 0, createdAt: '2025-01-01T00:00:00.000Z' },
      { id: 3, name: 'Curry House', link: 'https://curry.example', votes: 4, createdAt: '2025-01-01T00:00:00.000Z' },
    ])
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.8)

    const handled = await handlers.run('random', [])

    expect(handled).toBe(true)
    expect(getOptions).toHaveBeenCalledTimes(1)
    expect(pushOutput).toHaveBeenCalledWith('success', expect.arrayContaining([
      'Random pick: Curry House',
      'id: 3',
      'votes: 4',
      'link: https://curry.example',
    ]))

    randomSpy.mockRestore()
  })

  it('informs the user when random has no options', async () => {
    const handlers = buildHandlers()
    vi.mocked(getOptions).mockResolvedValue([])

    const handled = await handlers.run('random', [])

    expect(handled).toBe(true)
    expect(pushOutput).toHaveBeenCalledWith('info', [
      'No options available. Add one first with: add "Name" <link>',
    ])
  })
})
