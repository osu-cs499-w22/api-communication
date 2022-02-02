import React, { useState, useEffect } from 'react';

function useReposSearch(query) {
  const [ repos, setRepos ] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(false);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    async function fetchSearchResults() {
      let responseBody = {};
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.github.com/search/repositories?q=${query}`,
          { signal: controller.signal }
        );
        responseBody = await response.json();
      } catch (e) {
        if (e instanceof DOMException) {
          console.log("== HTTP request cancelled")
        } else {
          setError(true);
          throw e;
        }
      }
      if (!ignore) {
        setLoading(false);
        setError(false);
        setRepos(responseBody.items || []);
      }
    }
    if (query) {
      fetchSearchResults()
    }
    return () => {
      controller.abort();
      ignore = true;
    }
  }, [ query ]);

  return [ repos, loading, error ];
}

export default useReposSearch;
