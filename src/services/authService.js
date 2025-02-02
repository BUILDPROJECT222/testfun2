
const getUsers = () => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users) => {
  localStorage.setItem('users', JSON.stringify(users));
};

export const register = async (userData) => {
  // Simulasi network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const users = getUsers();
  
  // Check if username already exists
  if (users.find(user => user.username === userData.username)) {
    throw new Error('Username already exists');
  }

  // Check if email already exists
  if (users.find(user => user.email === userData.email)) {
    throw new Error('Email already registered');
  }

  // Add new user
  const newUser = {
    id: Date.now(),
    username: userData.username,
    email: userData.email,
    password: userData.password // In real app, password should be hashed
  };

  users.push(newUser);
  saveUsers(users);

  return { message: 'Registration successful' };
};

export const login = async (credentials) => {
  // Simulasi network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const users = getUsers();
  const user = users.find(
    u => u.username === credentials.username && u.password === credentials.password
  );

  if (!user) {
    throw new Error('Invalid username or password');
  }

  // Generate mock token
  const token = btoa(JSON.stringify({ userId: user.id, username: user.username }));

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  };
}; 