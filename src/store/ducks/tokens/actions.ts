import { action } from 'typesafe-actions';
import { TokenData, TokensTypes, User } from './types';

type Inputs = {
    email: string,
    password: string,
};

export const editProfile = (data: User) => action(TokensTypes.EDIT_PROFILE, { data });

export const loadSession = (data: Inputs) => action(TokensTypes.LOAD_SESSION, { data });

export const loadLogout = () => action(TokensTypes.LOAD_LOGOUT);

export const loadSessionSucess = (data: TokenData) => action(TokensTypes.LOAD_SESSIONSUCCCES, { data });

export const loadSessionFailure = () => action(TokensTypes.LOAD_SESSIONFAILURE);
