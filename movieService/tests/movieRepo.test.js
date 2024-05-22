const MovieRepo = require('../repos/movieRepo');
const Movie = require('../models/movieModel');
const { DatabaseException, NotFoundException } = require('../utils/customErrors');

const setupMock = (Model, method, returnValue) => {
    return jest.spyOn(Model, method).mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(returnValue)
    });
};

const mockMovie = { _id: '123', title: 'Test Movie', similarBestMovie: '456' };
const mockMovies = [{ _id: '123', title: 'Test Movie', similarBestMovie: '456' }];
const mockMovieData = { title: 'New Movie' };
const mockNewMovie = { _id: '123', ...mockMovieData };

// Helper function to clear mocks after each test
afterEach(() => {
    jest.clearAllMocks();
});

describe('MovieRepo', () => {

    describe('getById', () => {
        it('should return a movie if found', async () => {
            const findSpy = setupMock(Movie, 'find', [mockMovie]);

            const result = await MovieRepo.getById('123');
            expect(result).toEqual([mockMovie]);
            expect(findSpy).toHaveBeenCalledWith({ _id: '123' });
        });

        it('should throw NotFoundException if no movie is found', async () => {
            setupMock(Movie, 'find', null);

            await expect(MovieRepo.getById('123')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getAllMovies', () => {
        it('should return all movies matching the query', async () => {
            const findSpy = setupMock(Movie, 'find', mockMovies);

            const result = await MovieRepo.getAllMovies({ title: 'Test Movie' });
            expect(result).toEqual(mockMovies);
            expect(findSpy).toHaveBeenCalledWith({ title: 'Test Movie' });
        });

        it('should throw NotFoundException if no movies are found', async () => {
            setupMock(Movie, 'find', null);

            await expect(MovieRepo.getAllMovies({ title: 'Non-existent Movie' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create a new movie', async () => {
            const saveSpy = jest.spyOn(Movie.prototype, 'save').mockResolvedValueOnce(mockNewMovie);

            const result = await MovieRepo.create(mockMovieData);
            expect(result.title).toEqual(mockNewMovie.title);
            expect(saveSpy).toHaveBeenCalled();
        });

        it('should throw DatabaseException on create error', async () => {
            const saveSpy = jest.spyOn(Movie.prototype, 'save').mockRejectedValueOnce(new Error('Save error'));

            await expect(MovieRepo.create(mockMovieData)).rejects.toThrow(DatabaseException);
        });
    });
});