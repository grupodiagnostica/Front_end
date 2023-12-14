import React from 'react'
import { NavbarComp } from '../../components/Header/NavbarComp'

import './Diagnostico.css';
import { useEffect, useState } from 'react';
import { Avatar, Box, Text, Button, Textarea, Checkbox, Radio, RadioGroup, Stack, Select as SelectChakra } from '@chakra-ui/react'
import Select from 'react-select';
import { api } from '../../services/api.ts'
import { AiOutlineInfoCircle } from 'react-icons/ai';
import PDFReport from '../../components/Pdf/PdfViewer'
import { Document, Page } from 'react-pdf';
import jsPDF from 'jspdf';
import { useDispatch, useSelector } from 'react-redux';
import * as dayjs from 'dayjs'
import { Link, useNavigate } from 'react-router-dom';
import {imagemDeFundo} from '../../assets/logo d.png';
import { MyFooter } from '../../components/Footer/Footer'
import './Diagnostico.css'

export const Diagnostico = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageData, setUploadedImageData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patient, setPatient] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientsArray, setPatientsArray] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [predictionLabel, setPredictionLabel] = useState(null);
  const [imageCam, setImageCam] = useState(null);
  const [error, setError] = useState(false);
  const [pdfDataUri, setPdfDataUri] = useState(null);
  const [termo, setTermo] = useState(false);
  const [downloadLaudo, setDownloadLaudo] = useState(false);
  const [observacoes, setObservacoes] = useState('Seu laudo vem aqui...');
  const [loadingLaudo, setLoadingLaudo] = useState(false)
  const [resultLaudo, setResultLaudo] = useState(null)
  const [resultReal, setResultReal] = useState(null);
  const [laudoError, setLaudoError] = useState(false);

  const history = useNavigate()
  
  const { data: user } = useSelector((state) => state.tokens);

  const models = [
    { value: '1', label: 'Pneumonia - Crianças de até 5 anos' },
    { value: '2', label: 'Pneumonia, Covid, Tuberculose - mapa de calor' },
  ]

  async function loadPatients() {
    await api.get(`/paciente?id_medico=${user.data.id}`).then(({ data }) => {
      console.log(data)
      const patientsValues = []
      setPatientsArray(data)
      data.map((item) => {
        var patient = {
          value: item.id,
          label: `Nome: ${item.pessoa.nome} CPF: ${item.pessoa.cpf}`
        }
        patientsValues.push(patient)
      })
      setPatients(patientsValues)
    }).catch(({ err }) => {
      console.log(err)
    })
  }

  useEffect(() => {
    (async () => {
      await loadPatients()
    })()
  }, [])

  useEffect(() => {
    if (prediction != null) {
      createPDF()

    }
  }, [prediction, observacoes])


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadedImageData(file)
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Cria uma nova imagem
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        // Cria um canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        // Desenha a imagem no canvas
        context.drawImage(img, 0, 0, img.width, img.height);

        // Converte o conteúdo do canvas para JPEG
        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9);

        // Atualiza o estado com a imagem JPEG
        setUploadedImage(jpegDataUrl);
      };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContainerClick = () => {
    document.getElementById('file-input').click();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    setUploadedImageData(file)

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  function base64ToBlob(base64) {
    var parts = base64.split(';base64,');
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;
    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }

  function arrayToBase64(subarray) {
    // Converte o subarray para um ArrayBuffer
    var buffer = new Float32Array(subarray).buffer;

    // Converte o ArrayBuffer para uma string base64
    var base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));

    return base64String;
  }

  function downloadPDF(pdfDataUri) {
    // Seu PDF em formato Data URI (substitua isso pelo seu próprio Data URI)

    // Cria um link <a> temporário
    var link = document.createElement('a');
    link.href = pdfDataUri;

    // Define o atributo 'download' para indicar que é um download
    link.download = 'seu_arquivo.pdf';

    // Adiciona o link ao documento
    document.body.appendChild(link);

    // Simula um clique no link para iniciar o download
    link.click();

    // Remove o link do documento
    document.body.removeChild(link);
  }

  async function submitLaudo() {
    if(!resultLaudo){
      setLaudoError(true)
      return
    }else{
      setLaudoError(false)
    }
    const diagnostico = {
      modelo: selectedModel.label,
      raio_x: uploadedImage,
      id_medico: user.data.id,
      id_paciente: patient.id,
      laudo_medico: pdfDataUri,
      data_hora: new Date(),
      mapa_calor: "data:image/jpeg;base64," + imageCam,
      resultado_modelo: predictionLabel,
      resultado_real: resultLaudo == "1" ? predictionLabel : resultReal
    }

    console.log(diagnostico)

    await api.post(`/diagnostico`, diagnostico).then(({ data }) => {
      console.log(data)
      downloadPDF(data.data.laudo_medico)
      history('/historico')
    }).catch(({ err }) => {
      console.log(err)
    })
  }

  async function onSubmitImage() {
    if (patient === null) {
      setError(true)
      return
    }
    if (selectedModel === null) {
      setError(true)
      return
    }
    if (uploadedImageData === null) {
      setError(true)
      return
    }
    const formData = new FormData();
    formData.append('image', uploadedImageData);
    setLoadingLaudo(true)
    await api.post(`/predict/${selectedModel.value}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    }).then(({ data }) => {
      setLoadingLaudo(false)
      console.log(data)
      var imageData = data.image;
      setImageCam(imageData)
      setPredictionLabel(data.predictions[0])
      setPrediction(+data.predictions[1])
    }).catch(({ err }) => {
      console.log(err)
    })
  }

  const handlePatient = (patient) => {
    setSelectedPatient(patient)
    setPatient(patientsArray.find(item => item.id === patient.value))

  }
  function calcularIdade(dataNascimento) {
    var dataAtual = new Date();
    var dataNasc = new Date(dataNascimento);

    var diferenca = dataAtual - dataNasc;

    var idade = Math.floor(diferenca / (1000 * 60 * 60 * 24 * 365.25));

    return idade;
  }

  const createPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(25);
    doc.setFont('georgia', 'bold');
    doc.text('D.IAgnóstica - Seu assistente em diagnósticos', 20, 20);

    doc.rect(15, 35, 180, 30);
    doc.setFontSize(14);
    doc.text(`Paciente: ${patient?.pessoa?.nome}`, 20, 42);
    doc.text(`Idade: ${calcularIdade(patient?.pessoa?.data_nascimento)}`, 20, 52);
    doc.text(`Sexo: ${patient?.sexo}`, 20, 62);
    doc.text(`Medico: ${user?.data?.pessoa?.nome}`, 120, 42);
    doc.text(`Idade: ${dayjs().format('DD/MM/YYYY')}`, 120, 52);

    doc.rect(15, 70, 180, 16);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Tipo de exame: Raio X do tórax`, 20, 80);

    doc.rect(15, 90, 180, 170);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Laudo Médico:`, 20, 100);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'italic');
    doc.text(`${observacoes}`, 20, 120);

    doc.addPage();

    doc.rect(15, 28, 180, 10)

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("Mapa de Calor", 20, 35);


    doc.setFillColor(0, 0, 0);
    doc.rect(15, 45, 180, 200, 'F');
    doc.addImage(imageCam, 'JPEG', -5, 55, 210, 180);

    // Converte o PDF para base64
    const pdfDataUri = doc.output('datauristring');

    // Atualizar o número de páginas para exibição no visor de PDF
    setPdfDataUri(pdfDataUri)

    // Exibe o PDF diretamente na página
    // const pdfContainer = document.getElementById('pdf-container');
    // pdfContainer.innerHTML = `<embed src="${pdfDataUri}" width="100%" height="500px" type="application/pdf" />`;
  };

  const calcularPredicao = (predicao)=>{
    if(predicao > 0){
      return "PNEUMONIA"
    }
    if(predicao < 0){
      return "TURBECULOSE"
    }
    if(predicao > 0 && predicao < 1){
      return "COVID"
    }
  }
  return (
    <body>
      <header><NavbarComp showEntrarButton={true} /></header>
      {!prediction ? <Box display='flex' w='100%' alignItems='center' justifyContent='center' flexDirection='column'>
        <Box w='30%' padding='4rem 0'>
          <Box w='100%' >
            <Text lineHeight='0.2rem' fontWeight='bold'>SELECIONE O PACIENTE</Text>
            <Select
              value={selectedPatient}
              onChange={handlePatient}
              options={patients}
              isSearchable
              placeholder="Digite para buscar..."
            />


          </Box>

          <Box w='100%' mt='2rem'>
            <Text lineHeight='0.2rem' fontWeight='bold'>SELECIONE O TIPO DE EXAME</Text>
            <Select
              value={selectedModel}
              onChange={setSelectedModel}
              options={models}
              isSearchable
              placeholder="Digite para buscar..."
            />


          </Box>

          <Box
            mt='2rem'
            textAlign='center'
            border={isDragging ? '2px solid #4CAF50' : '2px dashed #ccc'}
            borderRadius='20px'
            padding='20px'
            cursor='pointer'
            marginBottom='20px'
            onClick={handleContainerClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            w='100%'
            height='50vh'
            display='flex'
            alignItems='center'
            justifyContent='center'
            background='d8d8d8'
          >
            {!uploadedImage &&
              <Box lineHeight='0.5rem'>
                <p id='titleDragInput'>Clique para fazer o upload </p>
                <p id='titleDragInput'>ou arraste sua imagem</p>
              </Box>

            }
            <input
              type="file"
              id="file-input"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />


            {uploadedImage && (
              <img
                src={uploadedImage}
                alt="Uploaded"
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
            )}



          </Box>
          
          <Button w='100%' colorScheme={error ? 'red' : 'blue'} isLoading={loadingLaudo} onClick={() => onSubmitImage()}>Gerar Laudo</Button>
          <Box display='flex' justifyContent='space-between'>
            <Box display={error && patient === null ? 'flex' : 'none'} color='red' alignItems='center' >
              <AiOutlineInfoCircle />
              <Text ml='0.2rem' mt='1rem'>Selecione um Paciente</Text>
            </Box>
            <Box display={error && selectedModel === null ? 'flex' : 'none'} color='red' alignItems='center' >
              <AiOutlineInfoCircle />
              <Text ml='0.2rem' mt='1rem'>Selecione um Modelo</Text>
            </Box>

            <Box display={error && uploadedImageData === null ? 'flex' : 'none'} color='red' alignItems='center' >
              <AiOutlineInfoCircle />
              <Text ml='0.2rem' mt='1rem'>Faça upload da imagem</Text>
            </Box>
          </Box>


        </Box>
      </Box> :
        <Box display='flex' w='100%' alignItems='center' justifyContent='center' flexDirection='column'>
          <Box margin='4rem 0' w='50%'>
            <Box padding='0.5rem' background='#323639'>
              <div>
                <embed src={pdfDataUri} width="100%" height="500px" type="application/pdf" />
              </div>
            </Box>


            <Box display='flex' flexDirection='column' fontWeight='bold' w='100%'
              justifyContent='left' alignItems='center' mt='1.5rem'>
              <Text justifySelf='center'>
                Laudo do modelo: {(Math.floor(prediction * 100) / 100)*100}% de {predictionLabel}
              </Text>
              {laudoError && <Text mt='1rem' justifySelf='center' color='red'>Informe a confimação do laudo</Text>}
              <Text justifySelf='center'>
                O Laudo do modelo está correto?
              </Text>
              
              <RadioGroup fontWeight='normal' onChange={setResultLaudo} value={resultLaudo}>
                <Stack direction='row'>
                  <Radio value='1'>Sim</Radio>
                  <Radio value='2'>Não</Radio>
                </Stack>
              </RadioGroup>

              {resultLaudo == 2 && <Box><Text>Qual o diagnóstico correto?</Text>
              <SelectChakra onChange={(e)=>setResultReal(e.target.value)}>
                <option value={"PNEUMONIA"}>PNEUMONIA</option>
                <option value={"TURBECULOSE"}>TURBECULOSE</option>
                <option value={"COVID"}>COVID</option>
                <option value={"NORMAL"}>NORMAL</option>
                </SelectChakra></Box>}
            </Box>

            <Box display='flex' flexDirection='column' fontWeight='bold' w='100%' justifyContent='center' alignItems='center' mt='1.5rem'>
              <Text>
                Escreva seu laudo
              </Text>
              <Textarea onChange={(e) => setObservacoes(e.target.value)} />

            </Box>
            <Box display='flex' alignItems='center' mt='1rem'>
              <Checkbox border='black' size='lg' borderRadius='2px' mr='0.5rem' borderWidth='3px' onChange={(e) => setTermo(e)} /> <Text as='span' >Declaro que li e os <Text as='span' color='blue'><Link to='/termos'>Termos de uso</Link></Text> </Text>

            </Box>
            <Box display='flex' alignItems='center' mt='1rem'>
              <Checkbox border='black' size='lg' borderRadius='2px' mr='0.5rem' borderWidth='3px' onChange={(e) => setTermo(e)} /><Text as='span'>Baixar o  laudo com a previsão do modelo</Text>

            </Box>
            <Box display='flex' mt='2rem' justifyContent='space-around'>
              <Button colorScheme='red' borderRadius='1rem' onClick={()=>setPrediction(null)}>Revogar Laudo</Button>
              <Button colorScheme='green' onClick={() => { submitLaudo() }} borderRadius='1rem'>Confirmar Laudo</Button>
            </Box>
          </Box>

        </Box>
      }


      <div>
        <MyFooter />
      </div>

    </body>
  )
}
