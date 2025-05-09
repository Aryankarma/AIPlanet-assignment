import myAxios from "@/lib/axios";

interface AuthStatus {
  authenticated: boolean;
  user?: {
    email: string;
    name: string;
    verified: boolean;
  }
}

export const checkAuthStatus = async (): Promise<AuthStatus> => {
  try {
    const response = await myAxios.get('http://localhost:8000/auth/status')
    return response.data as AuthStatus;
  } catch (error) {
    return { authenticated: false }
  }
}