/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Grid from '@mui/joy/Grid'
import Stack from '@mui/joy/Stack'
import Skeleton from '@mui/joy/Skeleton'
import Typography  from '@mui/joy/Typography'
import EmbedPDF from '../components/EmbedPDF'
import FormInstance from '../components/FormInstance'
import axios from 'axios'
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";


  function getSources(article) {
      const sources = [];
      if (article.pdfPath) {
        sources.push({
          label: 'PDF local',
          type: 'pdf',
          pdfPath: `${import.meta.env.VITE_APP_SERVER_URL}/${article.pdfPath}`,
          abstract: article.abstract || '',
          links: []
        });
      }

      const links = [];
      if (article.openAccessURL!== 'No hay openAccess para este artículo') {
        links.push({ label: 'Open Access', url: article.openAccessURL });
      }
      if (Array.isArray(article.other_url)) {
        article.other_url.forEach((src, idx) => {
          if (src.pdfLink) {
            links.push({ label: src.version || `Fuente ${idx + 1}`, url: src.pdfLink });
          } else if (src.link) {
            links.push({ label: src.version || `Fuente ${idx + 1}`, url: src.link });
          }
        });
      }
      if (article.doiUrl) {
        links.push({ label: 'DOI', url: article.doiUrl });
      }
      sources.push({
        label: 'Resumen y enlaces',
        type: 'abstract',
        pdfPath: null,
        abstract: article.abstract || '',
        links
      });
      return sources;
    }

const AnalizeArticle = () => {
    const {assignmentId, projectId, articleId} = useParams();
    const [form, setForm] = useState();
    const [loading, setLoading] = useState(false);
    const [activeSource, setActiveSource] = useState(0);
    const [availableSources, setAvailableSources] = useState([]);

    useEffect(()=>{
        setLoading(true);
        const fetchForm = async ()=>{
            try {
                const formInst = await axios.get(`${import.meta.env.VITE_APP_SERVER_URL}/instancia/project/${projectId}/instance/${assignmentId}`,
                {withCredentials: true})
                const {data:article}= await axios.get(`${import.meta.env.VITE_APP_SERVER_URL}/articulos/project/${projectId}/one/${articleId}`,
                {withCredentials:true})
                setForm(formInst.data);
                const allSources = getSources(article);
                setAvailableSources(allSources);
                setActiveSource(0);

            } catch (error) {
                setForm({msg:'No existe la instancia de formulario'})
                console.log(error)
            }finally{
                setLoading(false)
            }
        }
          fetchForm();
    },[assignmentId])


  return (
    <Box component='main' sx= {{p: 1, minWidth: '100%', minHeight:'100%', mx: 'auto', overflow:'hidden'}}> {/* contenedor mas externo*/}
    {loading?(
    <Stack spacing={2} useFlexGap sx={{ maxWidth: '60ch' }}>
        <Box sx={{ m: 'auto' }}>
            <Typography
            level="h1"
            sx={{ fontSize: 'xl', position: 'relative', overflow: 'hidden' }}
            >
            <Skeleton loading={loading}>A heading</Skeleton>
            </Typography>
            <Typography
            level="body-xs"
            sx={{ mt: 1, mb: 2, position: 'relative', overflow: 'hidden' }}
            >
            <Skeleton loading={loading}>HISTORY, PURPOSE AND USAGE</Skeleton>
            </Typography>
            <Typography sx={{ position: 'relative', overflow: 'hidden' }}>
            <Skeleton loading={loading}>
                <i>Lorem ipsum</i> is placeholder text commonly used in the graphic,
                print, and publishing industries for previewing layouts and visual
                mockups.
            </Skeleton>
            </Typography>
        </Box>
    </Stack>
    ) : (
        <PanelGroup direction="horizontal" style={{ width: '100%', borderRadius:10, boxShadow:15,}}>
            <Panel minSize={20} defaultSize={50}>
                <Box sx={{ bgcolor: 'background.body',p: 2, height: '100%',
                overflow: 'auto', scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {display: 'none'}
                }}>
                <FormInstance formInstance={form} projectId={projectId} />
                </Box>
            </Panel>
            <PanelResizeHandle style={{ width: 8, background: '#e0e0e0', cursor: 'col-resize' }} />
            <Panel minSize={20} defaultSize={50}>
                <Box sx={{p:1,position: 'sticky',height: '100%',overflow: 'hidden',bgcolor: 'background.body'}}>
                  <Select
                value={activeSource}
                onChange={(_, value) => setActiveSource(value)}
                sx={{ mb: 2, minWidth: 200 }}
              >
                {availableSources.map((src, idx) => (
                  <Option key={idx} value={idx}>
                    {src.label}
                  </Option>
                ))}
              </Select>
                <EmbedPDF
                  pdfPath={availableSources[activeSource]?.pdfPath}
                  abstract={availableSources[activeSource]?.abstract}
                  links={availableSources[activeSource]?.links}
                />
                </Box>
            </Panel>
        </PanelGroup>
      )}   
    </Box>
  )
}

export default AnalizeArticle
