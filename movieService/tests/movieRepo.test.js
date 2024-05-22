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

    describe('get', () => {
        it('should return filtered, sorted, and paginated movies', async () => {
            const mockMovies = [{ _id: '123', title: 'Test Movie', similarBestMovie: '456' }];
            const findSpy = jest.spyOn(Movie, 'find').mockImplementation(() => ({
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockMovies)
            }));

            const result = await MovieRepo.get('title=Test Movie', 'title', 'asc', 1, 10);
            expect(result).toEqual(mockMovies);
            expect(findSpy).toHaveBeenCalledWith({ title: 'Test Movie' });
            expect(Movie.find().sort).toHaveBeenCalledWith({ title: 1 });
            expect(Movie.find().skip).toHaveBeenCalledWith(0);
            expect(Movie.find().limit).toHaveBeenCalledWith(10);
        });

        it('should throw DatabaseException on database error', async () => {
            const findSpy = jest.spyOn(Movie, 'find').mockImplementation(() => ({
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockRejectedValue(new Error('Database error'))
            }));

            await expect(MovieRepo.get('title=Test Movie', 'title', 'asc', 1, 10)).rejects.toThrow(DatabaseException);
        });
    });

    describe('create', () => {
        it('should create a new movie', async () => {
            const mockMovieData = { title: 'New Movie' };
            const mockMovie = { _id: '123', ...mockMovieData };
            const saveSpy = jest.spyOn(Movie.prototype, 'save').mockResolvedValueOnce(mockMovie);

            const result = await MovieRepo.create(mockMovieData);
            expect(result).toEqual(mockMovie);
            expect(saveSpy).toHaveBeenCalled();
        });

        it('should throw DatabaseException on create error', async () => {
            const mockMovieData = { title: 'New Movie' };
            const saveSpy = jest.spyOn(Movie.prototype, 'save').mockRejectedValueOnce(new Error('Save error'));

            await expect(MovieRepo.create(mockMovieData)).rejects.toThrow(DatabaseException);
        });
    });
});
