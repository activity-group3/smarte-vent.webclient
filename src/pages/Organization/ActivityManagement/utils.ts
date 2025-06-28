 // No external enum imports needed in this utility file

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString();
};

export const getStatusColor = (status: string): 'warning' | 'info' | 'primary' | 'success' | 'error' | 'default' => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'PUBLISHED':
      return 'info';
    case 'IN_PROGRESS':
      return 'primary';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

export const getCategoryColor = (category: string): 'secondary' | 'primary' | 'success' | 'default' => {
  switch (category) {
    case 'THIRD_PARTY':
      return 'secondary';
    case 'UNIVERSITY':
      return 'primary';
    case 'STUDENT_ORGANIZATION':
      return 'success';
    default:
      return 'default';
  }
};

export const fetchWithAuth = async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = 'Something went wrong';
    try {
      const errorData = await response.json();
      errorMessage = (errorData.message || errorData.error || errorMessage) as string;
    } catch (e) {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    return (await response.json()) as T;
  }
  return (await response.text()) as unknown as T;
}; 
