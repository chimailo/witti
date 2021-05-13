import React from 'react'
import Helmet from 'react-helmet'
import {useTheme} from '@material-ui/core'

const Head: React.FC<{title: string, description?: string}> = ({title, description}) => {
    const theme = useTheme()

    return (
        <Helmet>
          <html lang="en" />
          <title>{title} | {description ? description : 'Witti'}</title>
          <meta name="theme-color" content={theme.palette.primary.main} />
          <meta name="description" content={description} />
        </Helmet>
    );
  }
  
export default Head
