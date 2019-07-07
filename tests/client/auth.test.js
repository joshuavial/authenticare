beforeEach(() => jest.resetModules())

describe('isAuthenticated', () => {
  it('returns true if token has not expired', () => {
    jest.doMock('../../client/token-storage', () => ({
      getToken: () => 'test-token'
    }))

    jest.doMock('../../client/decode', () => token => {
      const today = new Date()
      const tomorrow = today.setDate(today.getDate() + 1)
      return {
        exp: tomorrow / 1000 // milliseconds -> seconds
      }
    })

    const auth = require('../../client/auth')
    const result = auth.isAuthenticated()
    expect(result).toBeTruthy()
  })

  it('returns false if token has expired', () => {
    jest.doMock('../../client/token-storage', () => ({
      getToken: () => 'test-token',
      saveToken: () => {}
    }))

    jest.doMock('../../client/decode', () => token => {
      expect(token).toBe('test-token')
      const today = new Date()
      const yesterday = today.setDate(today.getDate() - 1)
      return {
        exp: yesterday / 1000 // milliseconds -> seconds
      }
    })

    const auth = require('../../client/auth')
    const result = auth.isAuthenticated()
    expect(result).toBeFalsy()
  })

  it('logs off the user if token has expired', () => {
    expect.assertions(2) // in case saveToken is never called
    jest.doMock('../../client/token-storage', () => ({
      getToken: () => 'test-token',
      saveToken: token => {
        expect(token).toBeNull()
      }
    }))

    jest.doMock('../../client/decode', () => token => {
      expect(token).toBe('test-token')
      const today = new Date()
      const yesterday = today.setDate(today.getDate() - 1)
      return {
        exp: yesterday / 1000 // milliseconds -> seconds
      }
    })

    const auth = require('../../client/auth')
    auth.isAuthenticated()
  })

  it('returns false if no token is present', () => {
    jest.doMock('../../client/token-storage', () => ({
      getToken: () => {} // no token returned
    }))

    const auth = require('../../client/auth')
    const result = auth.isAuthenticated()
    expect(result).toBeFalsy()
  })
})

describe('saveAuthToken', () => {
  it('saves the token and returns a decoded token', () => {
    const testToken = 'test-token'
    jest.doMock('../../client/token-storage', () => ({
      saveToken: token => {
        expect(token).toBe('test-token')
      }
    }))

    jest.doMock('../../client/decode', () => token => {
      expect(token).toBe('test-token')
      return {
        sub: 'token-test'
      }
    })

    const auth = require('../../client/auth')
    expect(auth.saveAuthToken(testToken).sub).toBe('token-test')
  })
})

describe('getAuthToken', () => {
  it('returns a decoded token when token is present', () => {
    jest.doMock('../../client/token-storage', () => ({
      getToken: () => 'test-token'
    }))

    jest.doMock('../../client/decode', () => token => {
      expect(token).toBe('test-token')
      return {
        sub: 'token-test'
      }
    })

    const auth = require('../../client/auth')
    expect(auth.getAuthToken().sub).toBe('token-test')
  })

  it('returns null if no token is present', () => {
    jest.doMock('../../client/token-storage', () => ({
      getToken: () => {} // no token returned
    }))

    const auth = require('../../client/auth')
    expect(auth.getAuthToken()).toBeNull()
  })
})

describe('getEncodedToken', () => {
  it('returns the encoded token', () => {
    jest.doMock('../../client/token-storage', () => ({
      getToken: () => 'test-token'
    }))

    const auth = require('../../client/auth')
    expect(auth.getEncodedToken()).toBe('test-token')
  })
})

describe('logOff', () => {
  it('attempts to save a null token', () => {
    expect.assertions(1)
    jest.doMock('../../client/token-storage', () => ({
      saveToken: token => {
        expect(token).toBeNull()
      }
    }))

    const auth = require('../../client/auth')
    auth.logOff()
  })
})
