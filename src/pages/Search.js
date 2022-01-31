import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import Spinner from '../components/Spinner';
import ErrorContainer from '../components/ErrorContainer';

function Search({ query }) {
  const [ inputQuery, setInputQuery ] = useState(query || "");
  const [ searchParams, setSearchParams ] = useSearchParams()

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

  return (
    <div>
      <form onSubmit={(e) => {
        e.preventDefault();
        setSearchParams({ q: inputQuery })
      }}>
        <input value={inputQuery} onChange={e => setInputQuery(e.target.value)} />
        <button type="submit">Search</button>
      </form>
      <h2>Search query: {query}</h2>
      {loading ? (
        <Spinner />
      ) : (
        <ul>
          {repos.map(repo => <li key={repo.id}>{repo.full_name}</li>)}
        </ul>
      )}
      {error && <ErrorContainer>Error!</ErrorContainer>}
    </div>
  );
}

export default Search;
