const MovieRepo = require('../repos/movieRepo');
const Movie = require('../models/movieModel');
const { DatabaseException, NotFoundException } = require('../utils/customErrors');

describe('MovieRepo', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getById', () => {
        it('should return a movie if found', async () => {
            const mockMovie = { _id: '123', title: 'Test Movie', similarBestMovie: '456' };
            const findSpy = jest.spyOn(Movie, 'find').mockReturnValueOnce({
                populate: jest.fn().mockResolvedValueOnce([mockMovie])
            });

            const result = await MovieRepo.getById('123');
            expect(result).toEqual([mockMovie]);
            expect(findSpy).toHaveBeenCalledWith({ _id: '123' });
        });

        it('should throw NotFoundException if no movie is found', async () => {
            jest.spyOn(Movie, 'find').mockReturnValueOnce({
                populate: jest.fn().mockResolvedValueOnce(null)
            });

            await expect(MovieRepo.getById('123')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getAllMovies', () => {
        it('should return all movies matching the query', async () => {
            const mockMovies = [{ _id: '123', title: 'Test Movie', similarBestMovie: '456' }];
            const findSpy = jest.spyOn(Movie, 'find').mockReturnValueOnce({
                populate: jest.fn().mockResolvedValueOnce(mockMovies)
            });

            const result = await MovieRepo.getAllMovies({ title: 'Test Movie' });
            expect(result).toEqual(mockMovies);
            expect(findSpy).toHaveBeenCalledWith({ title: 'Test Movie' });
        });

        it('should throw NotFoundException if no movies are found', async () => {
            jest.spyOn(Movie, 'find').mockReturnValueOnce({
                populate: jest.fn().mockResolvedValueOnce(null)
            });

            await expect(MovieRepo.getAllMovies({ title: 'Non-existent Movie' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create a new movie', async () => {
            const mockMovieData = { title: 'New Movie' };
            const mockMovie = { _id: '123', ...mockMovieData };
            const saveSpy = jest.spyOn(Movie.prototype, 'save').mockResolvedValueOnce(mockMovie);

            const result = await MovieRepo.create(mockMovieData);
            expect(result.title).toEqual(mockMovie.title);
            expect(saveSpy).toHaveBeenCalled();
        });

        it('should throw DatabaseException on create error', async () => {
            const mockMovieData = { title: 'New Movie' };
            const saveSpy = jest.spyOn(Movie.prototype, 'save').mockRejectedValueOnce(new Error('Save error'));

            await expect(MovieRepo.create(mockMovieData)).rejects.toThrow(DatabaseException);
        });
    });
});
