pragma solidity >=0.4.24 <0.6.0;
/**
  * @title Top Tracks
  * @dev Track play counts for songs
  */
contract toptracks {
    mapping(string => uint) public _counts;

    /**
      * @dev Increment the play count for a song
      * @param id The song ID
      */
    function increment(string memory id) public {
        _counts[id] = _counts[id] + 1;
    }

    /**
      * @dev Get the play count for a song
      * @param id The song ID
      */
    function get(string memory id) public view returns (uint count) {
        return _counts[id];
    }
}
