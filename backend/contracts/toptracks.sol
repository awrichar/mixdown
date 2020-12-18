pragma solidity >=0.4.24 <0.6.0;
pragma experimental ABIEncoderV2;

/**
  * @title Top Tracks
  * @dev Track play counts for songs
  */
contract toptracks {
    string[] _tracks;
    mapping(string => uint) _counts;

    /**
      * @dev Increment the play count for a song
      * @param isrc The song ISRC
      */
    function increment(string memory isrc) public {
        if (_counts[isrc] == 0) {
            _tracks.push(isrc);
        }
        _counts[isrc] += 1;
    }

    /**
      * @dev Get the play count for a song
      * @param isrc The song ISRC
      */
    function get(string memory isrc) public view returns (uint count) {
        return _counts[isrc];
    }

    /**
      * @dev Get all known songs
      */
    function getAll() public view returns (string[] memory tracks) {
        return _tracks;
    }
}
