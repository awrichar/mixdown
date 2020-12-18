pragma solidity >=0.4.24 <0.6.0;
pragma experimental ABIEncoderV2;

/**
  * @title Top Tracks
  * @dev Track play counts for songs
  */
contract toptracks {
    string[] _tracks;
    mapping(string => uint) _counts;
    mapping(address => bool) _distributors;

    constructor() public {
        _distributors[msg.sender] = true;
    }

    /**
      * @dev Add a new distributor
      * @param addr The new distributor's address
      */
    function addDistributor(address addr) public {
        require(
            _distributors[msg.sender],
            "Only a current distributor may add a new distributor."
        );
        _distributors[addr] = true;
    }

    /**
      * @dev Increment the play count for a song
      * @param isrc The song ISRC
      */
    function incrementSong(string memory isrc) public {
        require(
            _distributors[msg.sender],
            "Only a current distributor may increment play counts."
        );
        if (_counts[isrc] == 0) {
            _tracks.push(isrc);
        }
        _counts[isrc] += 1;
    }

    /**
      * @dev Get the play count for a song
      * @param isrc The song ISRC
      */
    function getSong(string memory isrc) public view returns (uint count) {
        return _counts[isrc];
    }

    /**
      * @dev Get all known songs
      */
    function getAllSongs() public view returns (string[] memory tracks) {
        return _tracks;
    }
}
