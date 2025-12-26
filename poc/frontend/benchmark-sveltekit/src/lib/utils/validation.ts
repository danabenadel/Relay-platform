import type { AuthFormData } from '$lib/types/auth';

export const validateEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
	return password.length >= 6;
};

export const validateAuthForm = (data: AuthFormData, isRegister: boolean): string | null => {
	if (!data.email.trim()) {
		return 'Email requis';
	}

	if (!validateEmail(data.email)) {
		return 'Email invalide';
	}

	if (!data.password.trim()) {
		return 'Mot de passe requis';
	}

	if (!validatePassword(data.password)) {
		return 'Mot de passe trop court (6 caractères minimum)';
	}

	if (isRegister && data.password !== data.confirmPassword) {
		return 'Les mots de passe ne correspondent pas';
	}

	return null;
};
