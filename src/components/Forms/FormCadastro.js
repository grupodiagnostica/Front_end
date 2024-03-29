import React from 'react';
import { useEffect, useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineInfoCircle } from 'react-icons/ai';
import { 
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure, 
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { api, apiUnAuth } from  '../../services/api.ts';
import { useSelector } from 'react-redux';
import { useHistorico } from '../../hooks/useHistorico';
import {cpf_mask_remove, telefone_mask_remove} from '../Forms/form-masks';
import * as yup from 'yup';
import $ from 'jquery';
import 'jquery-mask-plugin'
import './FormCadastro.css';


const schema = yup.object({
  nome: yup.string().required('Informe seu nome'),
  email: yup.string().email('Informe um e-mail válido').required('Informe um e-mail válido'),
  telefone: yup.string().required('Informe um telefone válido'),
  cpf: yup.string().min(14, 'CPF incompleto').required('Informe um cpf válido'),
  data_nascimento: yup.string().required('Informe uma data de nascimento válida'),
  crm: yup.string().min(6, 'CRM deve conter 6 dígitos').required('Informe um crm válido'),
  especialidade: yup.string().required('Informe uma especialidade válida'),
  senha: yup.string().min(8, 'A senha deve conter 8 caracteres').required('Digite uma senha'),
  confirmarSenha: yup.string().required('Digite sua senha novamente').oneOf([yup.ref("senha")], 'As senhas devem ser iguais')
}).required();

export const FormCadastro = () => {

  const { register, handleSubmit, formState: { errors }, } = useForm({
    resolver: yupResolver(schema)
  });

  const { isOpen, onOpen, onClose } = useDisclosure()

  const toast = useToast();
  const [onLoading, setOnLoading] = useState(false);
  const [showPassword, setShowPassword] = useState('password')
  const [visible, setVisible] = useState(true)
  const [nomePessoa, setNomePessoa] = useState(null)
  const [crmFild, setCrmField] = useState(null)
  const [cargoPessoa, setCargoPessoa] = useState(null)
  const { data: user } = useSelector((state) => state.tokens);
  const { handleHistorico } = useHistorico()
  
  const onSubmit = async (novoMedico) => {

    novoMedico.cpf = cpf_mask_remove(novoMedico.cpf)
    novoMedico.telefone = telefone_mask_remove(novoMedico.telefone)
   
    const pessoa = {
      cpf: novoMedico.cpf,
      data_nascimento: novoMedico.data_nascimento,
      nome: novoMedico.nome,
      telefone: novoMedico.telefone,
      cargo: 'Médico',
    }

    setOnLoading(true);

    toast.promise(
      apiUnAuth.post('/pessoa', pessoa).then(({ data }) => {
      const medico = {
        id_pessoa: data.data.id,
        crm: novoMedico.crm,
        especialidade: novoMedico.especialidade,
        senha: novoMedico.senha,
        email: novoMedico.email
      }
      setOnLoading(false);

      apiUnAuth.post(`/clinica/${user.data.id}/medico`, medico).then(({ data }) => {
        handleHistorico(null)
      }).catch(({ err })=>{
        throw err;
      })

    }).catch(({ error }) => {
      setOnLoading(false);
      throw error;
    }),
    {
      loading: { title: 'Cadastro em andamento.', description: 'Por favor, aguarde.' },
      success: { title: 'Médico cadastrado com sucesso!', description: 'O médico foi associado à clínica.', duration: 6000, isClosable: true},
      error: { title: 'Erro ao cadastrar médico.', description: 'Por favor, tente novamente.', duration: 6000, isClosable: true}, 
    });
  };

  useEffect( () => {
    if (!crmFild) { return }
    if (typeof crmFild != 'string') { return }
    if (crmFild.length != 6) { return }

    api.post(`/medico/${crmFild}`).then( ({ data }) => {
      if (data.result == 0) { return }
      setCargoPessoa(data.data.pessoa.cargo)
      setNomePessoa(data.data.pessoa.nome)
      onOpen()
    })
  }, [crmFild])
  
  function handleAssociarMedico() {
    let data = {crm: crmFild}

    toast.promise(
      api.put(`clinica/${user.data.id}/medico`, data).then(({ data }) => {
        handleHistorico(null)
        onClose()
      })
    , {
      success: { title: 'Sucesso', description: 'Um novo médico foi adicionado', duration: 2000 },
      error: { title: 'Falha', description: 'Médico não associado', duration: 2000 },
      loading: { title: `Adicionando ${nomePessoa}`, description: 'Por favor espere', duration: 2000 },
    })
  }

  function handleVoltarCadastroMedico() {
    document.getElementById('FormControlInputCRM').value = ''
    onClose()
  }

  function visibleIcon() {
    if (visible) {
      return (
        <AiOutlineEye size={24} color='#000000' />
      )
    } else {
      return <AiOutlineEyeInvisible size={24} color='#000000' />
    }

  }

  function showPassord() {
    if (showPassword === 'password') {
      setShowPassword('text')
      setVisible(false)
    } else {
      setShowPassword('password')
      setVisible(true)
    }
  }

  $(() => {
    $('#FormControlInputCPF').mask('000.000.000-00')
    $('#FormControlInputTel').mask('(00) 0 0000-0000')
    $('#FormControlInputCRM').mask('000000')
  });

  return (
    <>

      <Modal isOpen={isOpen} onClose={handleVoltarCadastroMedico}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{cargoPessoa}(a) já cadastrado</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Associar <b>{nomePessoa}</b> a clínica?
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='green' mr={3} onClick={handleAssociarMedico}>
              Associar {cargoPessoa}(a)
            </Button>
            <Button variant='blue' onClick={handleVoltarCadastroMedico}>Voltar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <form onSubmit={handleSubmit(onSubmit)} className="custom-formcomp">

      <div className="form-group mt-2 ">
          <label htmlFor="FormControlInputCRM">CRM*</label>
          <input
            type="text"
            className="form-control formcomp-input"
            id="FormControlInputCRM"
            placeholder="Insira o CRM do médico"
            onKeyUp={e => setCrmField(e.target.value)}
            {...register("crm")}
          />
          <div className={errors.crm ? 'showerror errorDiv' : 'hideerror errorDiv'}>
            <AiOutlineInfoCircle />
            <p>{errors.crm?.message}</p>
          </div>
        </div>

        <div className="form-group mt-2 ">
          <label htmlFor="FormControlInputNome">Nome*</label>
          <input
            type="text"
            className="form-control formcomp-input"
            id="FormControlInputNome"
            placeholder="Digite o nome do médico"
            {...register("nome")}
          />
          <div className={errors.nome ? 'showerror errorDiv' : 'hideerror errorDiv'}>
            <AiOutlineInfoCircle />
            <p>{errors.nome?.message}</p>
          </div>
        </div>

        <div className="form-group mt-2 ">
          <label htmlFor="FormControlInputEmail">Endereço de e-mail*</label>
          <input
            type="email"
            className="form-control formcomp-input"
            id="FormControlInputEmail"
            {...register("email")}
            placeholder="Insira um endereço de e-mail válido"
          />
          <div className={errors.email ? 'showerror errorDiv' : 'hideerror errorDiv'}>
            <AiOutlineInfoCircle />
            <p>{errors.email?.message}</p>
          </div>
        </div>
        <div className="form-group mt-2 ">
          <label htmlFor="FormControlInputCPF">CPF*</label>
          <input
            type="text"
            className="form-control formcomp-input"
            id="FormControlInputCPF"
            placeholder="Insira o CPF do médico (somente números)"
            {...register("cpf")}
          />

          <div className={errors.cpf ? 'showerror errorDiv' : 'hideerror errorDiv'}>
            <AiOutlineInfoCircle />
            <p>{errors.cpf?.message}</p>
          </div>
        </div>
        <div className="form-group mt-2 ">
          <label htmlFor="FormControlInputData">Data de nascimento*</label>
          <input
            type="date"
            className="form-control formcomp-input"
            id="FormControlInputData"
            placeholder="Insira a data de nascimento do médico"
            {...register("data_nascimento")}
          />
          <div className={errors.data_nascimento ? 'showerror errorDiv' : 'hideerror errorDiv'}>
            <AiOutlineInfoCircle />
            <p>{errors.data_nascimento?.message}</p>
          </div>

        </div>

        <div className="form-group mt-2 ">
          <label htmlFor="FormControlInputTel">Telefone*</label>
          <input
            type="tel"
            className="form-control formcomp-input"
            id="FormControlInputTel"
            placeholder="(99) 9 9999-9999"
            {...register("telefone")}
            title="Digite apenas números"
          />
          <div className={errors.telefone ? 'showerror errorDiv' : 'hideerror errorDiv'}>
            <AiOutlineInfoCircle />
            <p>{errors.telefone?.message}</p>
          </div>
        </div>

        <div className="form-group mt-2">
          <label htmlFor="FormControlInputEsp">Especialização*</label>
          <select
            className="form-control formcomp-input"
            id="FormControlInputEsp"
            {...register("especialidade")}
          >
            <option value="" disabled selected>
              Escolha um dos itens listados
            </option>
            <option value="adasd">Opção 1</option>
            <option value="2">Opção 2</option>
            <option value="3">Opção 3</option>
            <option value="4">Opção 4</option>
            <option value="5">Opção 5</option>
          </select>
          <div className={errors.especialidade ? 'showerror errorDiv' : 'hideerror errorDiv'}>
            <AiOutlineInfoCircle />
            <p>{errors.especialidade?.message}</p>
          </div>
        </div>

        <div className="form-group mt-2">
          <label htmlFor="FormControlInputSenha">Senha*</label>
          <input
            type="password"
            className="form-control formcomp-input"
            id="FormControlInputSenha"
            placeholder="Insira uma senha para o login médico"
            {...register("senha")}
          />
          <div className={errors.senha ? 'showerror errorDiv' : 'hideerror errorDiv'}>
            <AiOutlineInfoCircle />
            <p>{errors.senha?.message}</p>
          </div>
        </div>

        <div className="form-group mt-2">
          <label htmlFor="FormControlInputConfirmarSenha">Confirmar senha*</label>
          <input
            type="password"
            className="form-control formcomp-input"
            id="FormControlInputConfirmarSenha"
            placeholder="Informe a senha novamente"
            {...register("confirmarSenha")}
          />
          <div className={errors.confirmarSenha ? 'showerror errorDiv' : 'hideerror errorDiv'}>
            <AiOutlineInfoCircle />
            <p>{errors.confirmarSenha?.message}</p>
          </div>
        </div>

        <Button
          type="submit"
          colorScheme='blue'
          w='80%'
          className="inputbtn"
          isLoading={onLoading}
        >Cadastrar</Button>
      </form>

    </>
  );
};
