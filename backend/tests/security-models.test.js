const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

describe('Security & User Model Logic', () => {
  test('hashes password using bcrypt on save and strips password in toJSON', async () => {
    const rawPassword = 'SecurePassword123!';
    const user = new User({
      username: 'alice',
      email: 'alice@example.com',
      password: rawPassword,
      role: 'user',
      interests: ['chess', 'reading'],
    });

    // Manually trigger pre-save hook for testing the hashing logic
    await new Promise((resolve, reject) => {
      user.schema.s.hooks.execPre('save', user, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Verify password was securely hashed (not plaintext)
    expect(user.password).not.toBe(rawPassword);
    expect(user.password.startsWith('$2')).toBe(true);

    // Verify comparePassword method
    const isCorrect = await user.comparePassword(rawPassword);
    expect(isCorrect).toBe(true);

    const isWrong = await user.comparePassword('WrongPassword');
    expect(isWrong).toBe(false);

    // Verify toJSON removes the password property
    const json = user.toJSON();
    expect(json.password).toBeUndefined();
    expect(json.username).toBe('alice');
    expect(json.email).toBe('alice@example.com');
  });

  test('enforces role enum: user or admin', () => {
    const validUser = new User({
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123',
      role: 'user',
    });
    expect(validUser.validateSync()).toBeUndefined();

    const validAdmin = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });
    expect(validAdmin.validateSync()).toBeUndefined();

    const invalidRole = new User({
      username: 'charlie',
      email: 'charlie@example.com',
      password: 'password123',
      role: 'superhero',
    });
    const err = invalidRole.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.role).toBeDefined();
  });
});
