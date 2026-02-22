const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Departemen {
    id: string;
    name: string;
    code: string;
}

export interface ProgramStudi {
    id: string;
    name: string;
    code: string;
    departemenId: string;
}

export const masterDataService = {
    /**
     * Get all departemen
     */
    async getDepartemenList(): Promise<Departemen[]> {
        try {
            const response = await fetch(`${API_URL}/master/departemen/all`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Failed to fetch departemen list:', response.status);
                return [];
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching departemen list:', error);
            return [];
        }
    },

    /**
     * Get all program studi
     */
    async getProdiList(): Promise<ProgramStudi[]> {
        try {
            const response = await fetch(`${API_URL}/master/prodi/all`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Failed to fetch prodi list:', response.status);
                return [];
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching prodi list:', error);
            return [];
        }
    },

    /**
     * Get program studi filtered by departemen
     */
    async getProdiByDepartemen(departemenId: string): Promise<ProgramStudi[]> {
        try {
            const response = await fetch(`${API_URL}/master/prodi/by-departemen/${departemenId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Failed to fetch prodi by departemen:', response.status);
                return [];
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching prodi by departemen:', error);
            return [];
        }
    },
};
