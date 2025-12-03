const fetcher = async (url: string) => {
   const res = await fetch(url);
   
   if (!res.ok) {
     throw new Error(`Erro: ${res.status} ${res.statusText}`);
   }
   return res.json();
};
