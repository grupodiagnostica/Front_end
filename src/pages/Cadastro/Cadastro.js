import React from 'react'
import './Cadastro.css'
import { FormCadastro } from '../../components/Forms/FormCadastro'
import { useNavigate } from "react-router-dom";

export const Cadastro = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="cadastro-container">
        <div className="cadastro-background-image"></div>
        <div className="cadastro-formulario">

        <div className="cadastro-logo">
              <span
                className="login-faixa"
                onClick={() => {
                  navigate("/");
                }}
              >
                d.<span className="text-ia">IA</span>gnóstica
              </span>
            </div>
          <div className="cadastro-section">
            
            <h2>Cadastro</h2>
            <div className="cadastro-form">
              <FormCadastro />
            </div>
          </div>
        </div>

        </div>
      </>
      )
}
