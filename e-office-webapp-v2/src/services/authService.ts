const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface User {
  id: string;
  nama?: string;
  name?: string;
  email: string;
  role?: string;
  roleNames?: string[];
}

interface AuthResponse {
  user: User;
  token?: string;
  session?: any;
}

// Auto-login credentials for each role (DEVELOPMENT ONLY)
const DEV_CREDENTIALS: Record<string, { email: string; password: string }> = {
  mahasiswa: {
    email: 'andi.pratama@students.ac.id',
    password: 'password123',
  },
  admin_prodi: {
    email: 'admin.prodi@informatika.ac.id',
    password: 'password123',
  },
  ketua_prodi: {
    email: 'kaprodi@informatika.ac.id',
    password: 'password123',
  },
  admin_fakultas: {
    email: 'admin.surat@tu.ac.id',
    password: 'password123',
  },
  supervisor: {
    email: 'supervisor@akademik.ac.id',
    password: 'password123',
  },
  manajer_tu: {
    email: 'upa@akademik.ac.id',
    password: 'password123',
  },
  staff_fakultas: {
    email: 'admin.surat@tu.ac.id', // Using same as admin_fakultas for now
    password: 'password123',
  },
  upa: {
    email: 'upa@akademik.ac.id',
    password: 'password123',
  },
  super_admin: {
    email: 'superadmin@system.ac.id',
    password: 'password123',
  },
};

export const authService = {
  /**
   * Auto-login for development - bypasses login form
   */
  async autoLogin(role: string): Promise<AuthResponse | null> {
    const credentials = DEV_CREDENTIALS[role];
    if (!credentials) {
      throw new Error(`No credentials found for role: ${role}`);
    }
    
    return this.login(credentials.email, credentials.password);
  },

  async login(email: string, password: string): Promise<AuthResponse | null> {
    try {
      // Use Better Auth endpoint
      const response = await fetch(`${API_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Login failed:', response.status, errorData);
        throw new Error(`Login gagal. Periksa email dan password Anda.`);
      }

      const data = await response.json();
      
      // Better Auth returns user and session
      if (data.user) {
        // Store session info if needed
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // Store user info
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Get user roles from /me endpoint
        try {
          const userWithRoles = await this.getMe();
          return {
            user: userWithRoles || data.user,
            session: data.session,
          };
        } catch (roleError) {
          console.warn('Failed to get roles, using basic user data:', roleError);
          return {
            user: data.user,
            session: data.session,
          };
        }
      }

      throw new Error('Login gagal');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      // Call Better Auth logout
      await fetch(`${API_URL}/api/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if API call fails
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('token');
    }
  },

  async getMe(): Promise<User | null> {
    try {
      // Get session from Better Auth
      const response = await fetch(`${API_URL}/api/auth/get-session`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (data.user) {
        // Get roles from backend /me endpoint
        try {
          const rolesResponse = await fetch(`${API_URL}/me`, {
            method: 'GET',
            credentials: 'include',
          });
          
          if (rolesResponse.ok) {
            const rolesData = await rolesResponse.json();
            console.log('Roles data from /me:', rolesData);
            return {
              ...data.user,
              roles: rolesData.roles || [],
              roleNames: rolesData.roles || [],
            };
          }
        } catch (roleError) {
          console.warn('Failed to get roles:', roleError);
        }
        
        return data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Get me error:', error);
      return null;
    }
  },

  async getSession(): Promise<any> {
    try {
      // Get session from Better Auth
      const response = await fetch(`${API_URL}/api/auth/get-session`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },
};
