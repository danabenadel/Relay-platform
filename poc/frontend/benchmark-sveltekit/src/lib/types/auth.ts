export interface AuthFormData {
	email: string;
	password: string;
	confirmPassword?: string;
}

export interface AuthFormProps {
	mode: 'login' | 'register';
	onSubmit: (data: AuthFormData) => void;
	onToggleMode: () => void;
}
