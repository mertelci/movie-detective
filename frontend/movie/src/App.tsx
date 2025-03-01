import { useState, useEffect, useRef } from 'react'
import api, { MovieDetails, Genre, Person } from './services/api'
import { Tooltip } from 'react-tooltip'
import { FavoriteMovie, mapMovieToFavorite } from './types'

function App() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [yearRange, setYearRange] = useState('all') // varsayılan değer olarak 'all' ayarlandı
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en'])
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actorSearch, setActorSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Person[]>([])
  const [selectedActor, setSelectedActor] = useState<Person | null>(null)
  const [favoriteMovies, setFavoriteMovies] = useState<FavoriteMovie[]>([])
  const [showFavoriteToast, setShowFavoriteToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showFavorites, setShowFavorites] = useState(false)
  const [popularity, setPopularity] = useState<'high' | 'medium' | 'low' | 'all'>('all')
  const movieDetailsRef = useRef<HTMLDivElement>(null)
  const [openSection, setOpenSection] = useState<'genres' | 'period' | 'language' | null>(null);

  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' }
  ]

  const popularityLevels = [
    { value: 'all', label: 'All Movies' },
    { value: 'high', label: 'Popular' },
    { value: 'medium', label: 'Known' },
    { value: 'low', label: 'Less Known' }
  ]

  // Year range constants with English labels
  const decades = [
    { label: "All Time", value: "all" },
    { label: "1950s", value: "1950-1959" },
    { label: "1960s", value: "1960-1969" },
    { label: "1970s", value: "1970-1979" },
    { label: "1980s", value: "1980-1989" },
    { label: "1990s", value: "1990-1999" },
    { label: "2000s", value: "2000-2009" },
    { label: "2010s", value: "2010-2019" },
    { label: "2020s", value: "2020-2029" }
  ];

  useEffect(() => {
    if (selectedLanguages.length > 0) {
      loadGenres()
    }
  }, [selectedLanguages])

  useEffect(() => {
    // Load favorite movies from localStorage when component mounts
    const savedMovies = localStorage.getItem('favoriteMovies')
    if (savedMovies) {
      setFavoriteMovies(JSON.parse(savedMovies))
    }
  }, [])

  const loadGenres = async () => {
    try {
      const genreData = await api.getGenres(selectedLanguages)
      setGenres(genreData)
    } catch (err) {
      setError('Error loading genres')
    }
  }

  const searchActors = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const results = await api.searchPerson(query, selectedLanguages)
      setSearchResults(results)
    } catch (err) {
      console.error('Error searching actor:', err)
    }
  }

  const getRecommendation = async () => {
    setLoading(true)
    setError(null)

    try {
      const recommendation = await api.getRecommendation({
        genres: selectedGenres,
        yearRange,
        language: selectedLanguages,
        actorId: selectedActor?.id?.toString(),
        popularity
      })
      setMovie(recommendation)
      // Scroll to movie details after loading
      setTimeout(() => {
        movieDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error getting movie recommendation')
      setMovie(null)
    } finally {
      setLoading(false)
    }
  }

  const addToFavorites = (movie: MovieDetails) => {
    const favoriteMovie = mapMovieToFavorite(movie)
    const updatedFavorites = [...favoriteMovies]
    const movieIndex = favoriteMovies.findIndex(m => m.id === movie.id)
    
    if (movieIndex === -1) {
      updatedFavorites.push(favoriteMovie)
      setFavoriteMovies(updatedFavorites)
      localStorage.setItem('favoriteMovies', JSON.stringify(updatedFavorites))
    
    }
  }

  const removeFromFavorites = (movieId: number) => {
    const updatedFavorites = favoriteMovies.filter(m => m.id !== movieId)
    setFavoriteMovies(updatedFavorites)
    localStorage.setItem('favoriteMovies', JSON.stringify(updatedFavorites))

  }

  const isMovieFavorite = (movieId: number) => {
    return favoriteMovies.some(m => m.id === movieId)
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    setShowFavoriteToast(true)
    setTimeout(() => setShowFavoriteToast(false), 3000)
  }

  const toggleSection = (section: 'genres' | 'period' | 'language') => {
    setOpenSection(openSection === section ? null : section);
  };

  

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 bg-gradient-to-br from-dark-800 to-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="logo-font font-serif text-7xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent animate-float drop-shadow-lg">
            Movie Detective
          </h1>
          <p className="text-gray-400 mt-1 max-w-2xl mx-auto text-lg font-bold">let the detective to find it</p>
        </div>
        
        <div className="bg-dark-800/80 backdrop-blur-xl rounded-3xl shadow-xl mb-12 border border-gray-800/20 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="space-y-3">
              {/* Genres Section */}
              <div className="bg-gray-900/50 rounded-xl overflow-hidden transition-all duration-300">
                <button
                  onClick={() => toggleSection('genres')}
                  className="w-full px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors duration-300 group"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3.5 3.5c0-1.1.9-2 2-2h13c1.1 0 2 .9 2 2v17c0 1.1-.9 2-2 2h-13c-1.1 0-2-.9-2-2v-17z"/>
                    </svg>
                    <div>
                      <span className="text-base sm:text-xl font-semibold text-yellow-500">Genres</span>
                      {selectedGenres.length > 0 && (
                        <span className="text-sm sm:text-md font-medium text-yellow-500/80 ml-2 group-hover:text-yellow-400 transition-colors duration-300 line-clamp-1 pr-2">
                          ({genres.filter(g => selectedGenres.includes(g.id.toString())).map(g => g.name).join(', ')})
                        </span>
                      )}
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-yellow-500 transition-transform duration-300 ${
                      openSection === 'genres' ? 'transform rotate-180' : ''
                    } group-hover:scale-110`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                {openSection === 'genres' && (
                  <div className="px-4 sm:px-8 pb-6 pt-2 animate-fadeIn">
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {genres.map((genre) => (
                        <button
                          key={genre.id}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200
                            ${selectedGenres.includes(genre.id.toString())
                              ? 'bg-yellow-500 text-gray-900 shadow-lg'
                              : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80'}`}
                          onClick={() => {
                            const genreId = genre.id.toString();
                            setSelectedGenres(prev =>
                              prev.includes(genreId)
                                ? prev.filter(id => id !== genreId)
                                : [...prev, genreId]
                            );
                          }}
                        >
                          {genre.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Time Period Section */}
              <div className="bg-gray-900/50 rounded-xl overflow-hidden transition-all duration-300">
                <button
                  onClick={() => toggleSection('period')}
                  className="w-full px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors duration-300 group"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.3 4 2 5.3 2 7v12c0 1.7 1.3 3 3 3h14c1.7 0 3-.9 3-3V7c0-1.7-1.3-3-3-3z"/>
                    </svg>
                    <div>
                      <span className="text-base sm:text-xl font-semibold text-yellow-500">Time Period</span>
                      <span className="text-sm sm:text-md font-medium text-yellow-500/80 ml-2 group-hover:text-yellow-400 transition-colors duration-300">
                        ({decades.find(d => d.value === yearRange)?.label})
                      </span>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-yellow-500 transition-transform duration-300 ${
                      openSection === 'period' ? 'transform rotate-180' : ''
                    } group-hover:scale-110`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                {openSection === 'period' && (
                  <div className="px-4 sm:px-8 pb-6 pt-2 animate-fadeIn">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      {decades.map((decade) => (
                        <button
                          key={decade.value}
                          className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200
                            ${yearRange === decade.value
                              ? 'bg-yellow-500 text-gray-900 shadow-lg'
                              : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80'}`}
                          onClick={() => setYearRange(decade.value)}
                        >
                          {decade.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Language Section */}
              <div className="bg-gray-900/50 rounded-xl overflow-hidden transition-all duration-300">
                <button
                  onClick={() => toggleSection('language')}
                  className="w-full px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors duration-300 group"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04z"/>
                    </svg>
                    <div>
                      <span className="text-base sm:text-xl font-semibold text-yellow-500">Movie Language</span>
                      {selectedLanguages.length > 0 && (
                        <span className="text-sm sm:text-md font-medium text-yellow-500/80 ml-2 group-hover:text-yellow-400 transition-colors duration-300 line-clamp-1 pr-2">
                          ({availableLanguages.filter(l => selectedLanguages.includes(l.code)).map(l => l.name).join(', ')})
                        </span>
                      )}
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-yellow-500 transition-transform duration-300 ${
                      openSection === 'language' ? 'transform rotate-180' : ''
                    } group-hover:scale-110`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                {openSection === 'language' && (
                  <div className="px-8 pb-6 pt-2 animate-fadeIn">
                    <div className="flex flex-wrap gap-3">
                      {availableLanguages.map((lang) => (
                        <button
                          key={lang.code}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                            ${selectedLanguages.includes(lang.code)
                              ? 'bg-yellow-500 text-gray-900 shadow-lg'
                              : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80'}`}
                          onClick={() => {
                            setSelectedLanguages(prev =>
                              prev.includes(lang.code)
                                ? prev.filter(code => code !== lang.code)
                                : [...prev, lang.code]
                            );
                          }}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Popularity Section */}
              <div className="bg-gray-900/50 rounded-xl p-4 sm:p-8">
                <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4 text-yellow-500 flex items-center gap-2 sm:gap-3 group">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
                  </svg>
                  <div>
                    <span>Movie Popularity</span>
                    {popularity !== 'all' && (
                      <span className="text-sm sm:text-md font-medium text-yellow-500/80 ml-2 group-hover:text-yellow-400 transition-colors duration-300">
                        ({popularityLevels.find(p => p.value === popularity)?.label})
                      </span>
                    )}
                  </div>
                  <span className="ml-1 sm:ml-2 text-gray-400 cursor-help" data-tooltip-id="popularity-help">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                    </svg>
                  </span>
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                  {popularityLevels.map((level) => (
                    <button
                      key={level.value}
                      className={`px-2 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2
                        ${popularity === level.value
                          ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 transform scale-[1.02]'
                          : 'bg-dark-700 text-gray-300 hover:bg-dark-600'}`}
                      onClick={() => setPopularity(level.value as 'high' | 'medium' | 'low' | 'all')}
                    >
                      {level.value === 'high' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/>
                        </svg>
                      )}
                      {level.value === 'medium' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/>
                        </svg>
                      )}
                      {level.value === 'low' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/>
                        </svg>
                      )}
                      {level.value === 'all' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/>
                        </svg>
                      )}
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cast Member Section */}
              <div className="bg-gray-900/50 rounded-xl p-4 sm:p-8">
                <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4 text-yellow-500 flex items-center gap-2 sm:gap-3 group">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z"/>
                  </svg>
                  <div>
                    <span>Cast Member</span>
                    {selectedActor && (
                      <span className="text-sm sm:text-md font-medium text-yellow-500/80 ml-2 group-hover:text-yellow-400 transition-colors duration-300">
                        ({selectedActor.name})
                      </span>
                    )}
                  </div>
                  <span className="ml-1 sm:ml-2 text-gray-400 cursor-help" data-tooltip-id="cast-help">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                    </svg>
                  </span>
                </h3>
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={actorSearch}
                      onChange={(e) => {
                        setActorSearch(e.target.value)
                        searchActors(e.target.value)
                      }}
                      placeholder="Search for an actor or director..."
                      className="w-full px-5 py-4 pl-12 rounded-xl bg-dark-700 text-white border border-dark-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-dark-400 "
                    />
                    <svg 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-gray-900 border border-dark-600 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                      {searchResults.map(person => (
                        <div
                          key={person.id}
                          className="px-5 py-3 hover:bg-dark-600 cursor-pointer transition-colors duration-200 flex items-center space-x-3"
                          onClick={() => {
                            setSelectedActor(person)
                            setActorSearch(person.name)
                            setSearchResults([])
                          }}
                        >
                          {person.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w45${person.profile_path}`}
                              alt={person.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white">
                              {person.name.charAt(0)}
                            </div>
                          )}
                          <span className="text-gray-200">{person.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedActor && (
                    <div className="mt-3 p-4 bg-dark-700/50 rounded-xl border border-primary-500/30 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {selectedActor.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${selectedActor.profile_path}`}
                              alt={selectedActor.name}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center text-yellow-imdb text-xl font-bold">
                              {selectedActor.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="text-yellow-imdb font-medium">{selectedActor.name}</h4>
                            <p className="text-sm text-gray-400">{selectedActor.known_for_department}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedActor(null)
                            setActorSearch('')
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          aria-label="Remove selected actor"
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button 
                className={`w-full py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg relative transition-all overflow-hidden
                  ${loading 
                    ? 'bg-dark-800/80 cursor-not-allowed text-gray-400' 
                    : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 hover:from-yellow-400 hover:to-amber-400 shadow-lg shadow-amber-500/20 transform hover:scale-[1.01] active:scale-[0.98]'}`}
                onClick={getRecommendation}
                disabled={loading}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="animate-spin mr-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      Finding a Movie...
                    </>
                  ) : (
                    <>
                      Discover a Movie
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Tooltips */}
        <Tooltip id="genre-help" place="top">
          Select one or more genres to find movies in those categories
        </Tooltip>
        <Tooltip id="period-help" place="top">
          Choose the time period for your movie recommendation
        </Tooltip>
        <Tooltip id="cast-help" place="top">
          Search for your favorite actor or director
        </Tooltip>
        <Tooltip id="genre-tag" place="top" />
        <Tooltip id="rating-info" place="top" />
        <Tooltip id="language-help" place="top">
          Select one or more languages for movie recommendations
        </Tooltip>
        <Tooltip id="popularity-help" place="top">
          Select the popularity level for movie recommendations
        </Tooltip>

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-4 border-gray-700/30"></div>
              <div className="absolute inset-0 rounded-full border-t-4 border-r-4 border-yellow-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 bg-yellow-500 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-dark-800/80 backdrop-blur-xl p-6 rounded-xl border border-red-500/20 shadow-lg">
            <div className="flex items-center text-red-400">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        ) : movie && (
          <div ref={movieDetailsRef} className="bg-gradient-to-b from-dark-800/90 to-black/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800/30 overflow-hidden animate-fadeIn transition-all hover:shadow-yellow-500/10 mb-16">
            <div className="md:flex">
              <div className="md:flex-shrink-0 relative overflow-hidden md:w-[300px] lg:w-[350px] group">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover md:h-full transition-transform group-hover:scale-[1.03] duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent md:bg-gradient-to-r md:from-black/30 md:to-transparent"></div>
              </div>
              <div className="p-5 md:p-8 flex-1 bg-gradient-to-br from-gray-900/90 to-black/80 relative overflow-hidden">
                <div className="mb-5 flex flex-wrap justify-between items-start gap-3">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow pr-2">{movie.title}</h2>
                  <button
                    onClick={() => {
                      if (isMovieFavorite(movie.id)) {
                        removeFromFavorites(movie.id);
                        showToast(`"${movie.title}" removed from watchlist`);
                      } else {
                        addToFavorites(movie);
                        showToast(`"${movie.title}" added to watchlist`);
                      }
                    }}
                    className={`p-2 md:p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      isMovieFavorite(movie.id)
                        ? 'text-red-500 hover:text-gray-300'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                    data-tooltip-id="favorite-tooltip"
                    data-tooltip-content={isMovieFavorite(movie.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    <svg 
                      className="w-7 h-7 md:w-8 md:h-8" 
                      fill={isMovieFavorite(movie.id) ? 'currentColor' : 'none'} 
                      stroke="currentColor" 
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-300 text-base md:text-lg leading-relaxed line-clamp-3 md:line-clamp-none">{movie.overview}</p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-300">
                      <div className="bg-yellow-500/10 p-2 rounded-lg mr-3 flex-shrink-0">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/>
                        </svg>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-yellow-500 whitespace-nowrap">Rating:</span>
                        <div className="flex items-baseline flex-wrap">
                          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{movie.vote_average.toFixed(1)}</span>
                          <span 
                            className="ml-2 text-xs sm:text-sm text-gray-400"
                          >
                            ({new Intl.NumberFormat(selectedLanguages.includes('tr') ? 'tr-TR' : 'en-US').format(movie.vote_count)} votes)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-300">
                      <div className="bg-yellow-500/10 p-2 rounded-lg mr-3 flex-shrink-0">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-yellow-500 mr-2">Duration:</span>
                        {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                      </div>
                    </div>

                    <div className="flex items-center text-gray-300">
                      <div className="bg-yellow-500/10 p-2 rounded-lg mr-3 flex-shrink-0">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z"/>
                        </svg>
                      </div>
                      <div className="min-w-0 truncate">
                        <span className="font-semibold text-yellow-500 mr-2">Director:</span>
                        <span className="truncate">{movie.director || 'No information'}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-300">
                      <div className="bg-yellow-500/10 p-2 rounded-lg mr-3 flex-shrink-0">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-yellow-500 mr-2">Release:</span>
                        <span className="truncate">{new Date(movie.release_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <h3 className="text-yellow-500 font-semibold mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4 11h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1zm0 8h6c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1zm10 0h6c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1zM13 4v6c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1z"/>
                        </svg>
                        Genres
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {movie.genres.map(genre => (
                          <span
                            key={genre.id}
                            className="px-2 py-1 sm:px-3 sm:py-1.5 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-full text-xs sm:text-sm font-semibold"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-8">
                      {movie.imdb_id && (
                        <a
                          href={`https://www.imdb.com/title/${movie.imdb_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-br from-yellow-500 to-amber-600 text-gray-900 text-sm font-medium rounded-lg hover:from-yellow-400 hover:to-amber-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-yellow-500/25"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14.31 9.588v.005c-.077-.048-.227-.07-.42-.07v4.815c.222 0 .373-.023.437-.07.065-.046.097-.226.097-.534V9.588h-.114zm2.887 2.585c-.044.187-.193.28-.435.28v-2.316c.263 0 .404.092.422.28.02.185.032.647.032 1.387-.01.667-.02 1.11-.02 1.37zm5.804-9.092H1C.45 3.08 0 3.53 0 4.08v15.84c0 .55.45 1 1 1h22c.55 0 1-.45 1-1V4.08c0-.55-.45-1-1-1zM7.263 14.468h-2.05V9.11H4.05v-1.68h4.348v1.68H7.263v5.358zm3.887 0h-1.752V7.43h1.752v7.038zm7.014-.404c-.172.404-.456.592-.834.592-.172 0-.484-.113-.936-.338v.15h-1.67V7.43h1.67v2.24c.444-.226.774-.338.988-.338.492 0 .814.366.962 1.097.064.37.097.912.097 1.622 0 .754-.097 1.414-.277 1.613z"/>
                          </svg>
                          <span className="font-medium">View on IMDb</span>
                        </a>
                      )}
                      {movie.trailer && (
                        <a
                          href={`https://www.youtube.com/watch?v=${movie.trailer}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-br from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-red-600/25"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          <span className="font-medium">Watch Trailer</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {movie.credits?.cast && movie.credits.cast.length > 0 && (
                  <div className="border-t border-gray-800/50 pt-6 mt-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-yellow-500 mb-4 sm:mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z"/>
                      </svg>
                      Cast
                    </h3>
                    <div className="flex gap-3 sm:gap-6 overflow-x-auto pb-4 cast-scroll">
                      {movie.credits.cast.slice(0, 6).map(actor => (
                        <div key={actor.id} className="flex-none w-24 sm:w-32 transform transition-all duration-300 hover:scale-[1.05]">
                          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto overflow-hidden rounded-xl group">
                            {actor.profile_path ? (
                              <img 
                                src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                alt={actor.name}
                                className="w-24 h-24 sm:w-32 sm:h-32 object-cover shadow-lg group-hover:scale-[1.1] transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gray-800 flex items-center justify-center text-yellow-500 text-2xl sm:text-3xl font-semibold">
                                {actor.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="mt-3 text-center">
                            <p className="font-semibold text-white text-sm sm:text-base truncate">{actor.name}</p>
                            <p className="text-xs sm:text-sm text-gray-400 italic truncate">{actor.character}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 sm:mt-10 flex justify-end">
                  <button 
                    className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 font-semibold rounded-xl hover:from-yellow-400 hover:to-amber-400 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-yellow-500/30 text-sm sm:text-base"
                    onClick={getRecommendation}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Finding Another...
                      </>
                    ) : (
                      <>
                        Discover Another Movie
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      

        {/* Add new tooltips */}
        <Tooltip id="favorite-tooltip" place="left" />
        <Tooltip id="remove-favorite" place="left" />
      </div>

    
      {showFavoriteToast && (
        <div className="fixed bottom-4 right-4 bg-dark-800/95 text-white px-6 py-3 rounded-xl shadow-xl border border-yellow-imdb/20 animate-fadeIn flex items-center">
          <svg className="w-5 h-5 mr-2 text-yellow-imdb" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/>
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Favori filmler bölümü */}
      {favoriteMovies.length > 0 && (
        <div className="fixed bottom-0 right-0 m-2 sm:m-4 z-50">
          <div className="flex flex-col items-end">
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className="mb-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 cursor-pointer rounded-xl shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 flex items-center gap-2 sm:gap-3 text-sm sm:text-lg font-semibold"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              Watchlist ({favoriteMovies.length})
            </button>
            
            {showFavorites && (
              <div className="bg-gradient-to-br from-gray-900/95 to-black/95 rounded-xl shadow-2xl border border-gray-800/30 backdrop-blur-lg w-full sm:w-[500px] max-h-[60vh] sm:max-h-[80vh] overflow-y-auto animate-fadeIn favorites-scroll fixed sm:static right-0 sm:right-auto left-0 sm:left-auto bottom-0 sm:bottom-auto">
                <div className="p-3 sm:p-5 flex justify-between items-center sticky top-0 bg-gradient-to-b from-gray-900/95 to-gray-900/80 backdrop-blur-md z-10 border-b border-gray-800/50">
                  <h2 className="text-base sm:text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-amber-400">My Watchlist</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowFavorites(false)}
                      className="p-2 text-gray-400 hover:text-gray-200 sm:hidden"
                      aria-label="Close watchlist"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                      </svg>
                    </button>
                    {favoriteMovies.length > 0 && (
                      <button
                        onClick={() => {
                          setFavoriteMovies([]);
                          localStorage.removeItem('favoriteMovies');
                          showToast('Watchlist cleared');
                        }}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-300 flex items-center gap-1 sm:gap-2 shadow-md"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                        </svg>
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-gray-800/30">
                  {favoriteMovies.map(favMovie => (
                    <div key={favMovie.id} className="p-3 sm:p-5 hover:bg-gray-800/50 transition-all duration-300">
                      <div className="flex gap-3 sm:gap-5">
                        <div className="relative overflow-hidden rounded-lg flex-shrink-0 group w-16 sm:w-20 h-24 sm:h-30">
                          <img
                            src={`https://image.tmdb.org/t/p/w185${favMovie.poster_path}`}
                            alt={favMovie.title}
                            className="w-full h-full object-cover shadow-lg group-hover:scale-[1.05] transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
                            <button
                              onClick={() => {
                                removeFromFavorites(favMovie.id);
                               
                              }}
                              className="p-1.5 sm:p-2 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
                              aria-label="Remove from watchlist"
                            >
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1 sm:mb-3">
                            <div>
                              <h3 className="text-white font-semibold text-sm sm:text-lg truncate pr-2">{favMovie.title}</h3>
                              <div className="flex items-center text-xs sm:text-sm text-gray-300 gap-1 sm:gap-2 mt-1">
                                <div className="flex items-center bg-yellow-500/10 px-1 sm:px-2 py-0.5 rounded-md">
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mr-0.5 sm:mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/>
                                  </svg>
                                  <span className="text-yellow-500 font-medium">{favMovie.vote_average.toFixed(1)}</span>
                                </div>
                                <span className="text-gray-500">•</span>
                                <div className="bg-gray-800/70 px-1 sm:px-2 py-0.5 rounded-md text-gray-300 text-xs">
                                  {new Date(favMovie.release_date).getFullYear()}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                removeFromFavorites(favMovie.id);
                                showToast(`"${favMovie.title}" removed from watchlist`);
                              }}
                              className="p-1 sm:p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                              aria-label="Remove from watchlist"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                              </svg>
                            </button>
                          </div>
                          
                          <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-4">{favMovie.overview}</p>
                          
                          <div className="flex gap-2 sm:gap-3">
                            {favMovie.imdb_id && (
                              <a
                                href={`https://www.imdb.com/title/${favMovie.imdb_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 text-xs font-medium rounded-md hover:from-yellow-400 hover:to-amber-400 transition-all duration-300 flex items-center gap-1 sm:gap-1.5 shadow-sm"
                              >
                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M14.31 9.588v.005c-.077-.048-.227-.07-.42-.07v4.815c.222 0 .373-.023.437-.07.065-.046.097-.226.097-.534V9.588h-.114zm2.887 2.585c-.044.187-.193.28-.435.28v-2.316c.263 0 .404.092.422.28.02.185.032.647.032 1.387-.01.667-.02 1.11-.02 1.37zm5.804-9.092H1C.45 3.08 0 3.53 0 4.08v15.84c0 .55.45 1 1 1h22c.55 0 1-.45 1-1V4.08c0-.55-.45-1-1-1zM7.263 14.468h-2.05V9.11H4.05v-1.68h4.348v1.68H7.263v5.358zm3.887 0h-1.752V7.43h1.752v7.038zm7.014-.404c-.172.404-.456.592-.834.592-.172 0-.484-.113-.936-.338v.15h-1.67V7.43h1.67v2.24c.444-.226.774-.338.988-.338.492 0 .814.366.962 1.097.064.37.097.912.097 1.622 0 .754-.097 1.414-.277 1.613z"/>
                                </svg>
                                IMDb
                              </a>
                            )}
                            {favMovie.trailer && (
                              <a
                                href={`https://www.youtube.com/watch?v=${favMovie.trailer}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-medium rounded-md hover:from-red-500 hover:to-red-600 transition-all duration-300 flex items-center gap-1 sm:gap-1.5 shadow-sm"
                              >
                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                                Trailer
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {favoriteMovies.length === 0 && (
                  <div className="py-8 sm:py-10 px-5 text-center">
                    <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-3 sm:mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <p className="text-gray-500">Your watchlist is empty</p>
                    <p className="text-gray-400 text-xs sm:text-sm mt-2">Movies you add to your watchlist will appear here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast bildirimi */}
      {showFavoriteToast && (
        <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 bg-dark-800/95 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-xl border border-yellow-500/20 animate-fadeIn flex items-center text-sm sm:text-base">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          {toastMessage}
        </div>
      )}
    </div>
  )
}

export default App
