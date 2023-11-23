import React from 'react'
import './Login.css'
import { FormLogin } from '../../components/Forms/FormLogin'

export const Login = () => {
  return (
    <>
    <div className="login-container">
        <div className="login-background-image"></div>
        <div className="login-formulario">
          <div className="login-logo"> <img src={require('../../assets/noto_lungs.png')}/>d.IAgnóstica</div>
          <div className="login-section">
            <div className="login-welcome">
            <h2>Seja Bem-Vindo</h2>
            </div>
            <div className="login-form">
              <FormLogin/>
            </div>
          </div>
        </div>    
    </div>
    </>
  )
}
