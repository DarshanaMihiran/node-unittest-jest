// tests/movieService.test.js
const movieRepo = require('../repos/movieRepo');
const movieService = require('../services/MovieService');
const { movieData } = require('./testData');
const { setupMock, expectCalledWith, expectResult } = require('./utils');

// Mocking the movieRepo methods
jest.mock('../repos/movieRepo');

describe('MovieService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    const filter = {};
    const sort = 'title';
    const order = 'asc';
    const page = 1;
    const limit = 2;

    it('should call movieRepo.get with correct parameters', async () => {
      await movieService.get(filter, sort, order, page, 1);
      expectCalledWith(movieRepo, 'get', [filter, sort, order, page, 1]);
    });

    it('should call movieRepo.get with correct parameters and return the correct data', async () => {
      setupMock(movieRepo, 'get', movieData);
      await expectResult(movieService.get.bind(movieService), [filter, sort, order, page, limit], movieData);
    });
  });

  describe('getById', () => {
    const id = '12345';
    const expectedData = { title: 'Inception', year: 2010 };

    it('should call movieRepo.getById with correct id and return the correct data', async () => {
      setupMock(movieRepo, 'getById', expectedData);
      await expectResult(movieService.getById.bind(movieService), [id], expectedData);
      expectCalledWith(movieRepo, 'getById', [id]);
    });
  });

  describe('createMovie', () => {
    const movieData = {
      title: 'Inception456',
      year: 2010,
      genre: 'Sci-Fi',
      director: 'Christopher Nolan',
      rating: 8.8,
      similarBestMovie: 'The Matrix',
      scores: [9, 8, 10],
      mainActors: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt']
    };

    it('should call movieRepo.create with correct parameters', async () => {
      await movieService.createMovie(
        movieData.title,
        movieData.year,
        movieData.genre,
        movieData.director,
        movieData.rating,
        movieData.similarBestMovie,
        movieData.scores,
        movieData.mainActors
      );

      expectCalledWith(movieRepo, 'create', [movieData]);
    });
  });
});
