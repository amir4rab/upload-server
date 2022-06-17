/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next'
import { useEffect, useRef, useState } from 'react'

const Home: NextPage = () => {
  const [ files, setFiles ] = useState< string[] >([]);
  const uploadInputRef = useRef< HTMLInputElement | null >(null);
  const firstRender = useRef(true);

  const updateInputBox = async () => {
    const res = await fetch(
      '/api/get-all',
    );
    const json = await res.json();
    const { files, successful, error } = json as {
      error: string | null;
      successful: boolean;
      files: string[];
    };

    if ( !successful ) {
      console.error(error); 
      return;
    }
    
    setFiles(files);
  }

  const onUpload = async () => {
    if ( uploadInputRef.current === null ) return;
    const files = uploadInputRef.current.files;
    if ( files === null || files?.length === 0 ) return;
    const formData = new FormData();

    Object.keys(files).forEach((file) => {
      formData.append(file, files![+file]);
    });

    const res = await fetch(
      '/api/upload',
      {
        method: 'POST',
        body: formData
      }
    );
    const json = await res.json();
    console.log(json);

    uploadInputRef.current.value = '';
    updateInputBox();
  }

  useEffect(() => {
    if ( !firstRender.current ) return;

    updateInputBox();

    firstRender.current = false;
  }, [])

  return (
    <main style={{ maxWidth: '600px', margin: 'auto', height: '100vh', display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <div>
        <input type='file' multiple ref={ uploadInputRef } />
        <button onClick={ onUpload }> upload </button>
      </div>
      <div style={{ padding: '1rem', marginTop: '1rem', minHeight: '500px', background: '#eee', width: '100%', overflowY: 'scroll', maxHeight: '500px' }}>
        { files.map(item => <img style={{ width: '250px', height: '250px', objectFit: 'scale-down' }} src={ item } key={ item } alt={ item } />) }
        { files.length === 0 && 'There is no files yet!' }
      </div>
    </main>
  )
}

export default Home
