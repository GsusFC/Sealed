// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SealedDiary
 * @dev A smart contract for sealing diary entries permanently on-chain
 * @notice This contract allows users to seal their diary entries on Base L2
 */
contract SealedDiary {
    struct SealedEntry {
        uint256 timestamp;
        bytes32 contentHash;
        uint16 wordCount;
        string mood;
    }

    // Mapping from FID to array of content hashes
    mapping(uint256 => bytes32[]) public userEntries;

    // Mapping from content hash to sealed entry details
    mapping(bytes32 => SealedEntry) public entries;

    event EntrySealed(
        uint256 indexed fid,
        bytes32 indexed contentHash,
        uint256 timestamp,
        uint16 wordCount
    );

    /**
     * @dev Seal a diary entry on-chain
     * @param fid Farcaster ID of the user
     * @param contentHash Keccak256 hash of the entry content
     * @param wordCount Number of words in the entry
     * @param mood Mood emoji/string for the entry
     */
    function seal(
        uint256 fid,
        bytes32 contentHash,
        uint16 wordCount,
        string memory mood
    ) external {
        require(contentHash != bytes32(0), "Invalid content hash");
        require(entries[contentHash].timestamp == 0, "Entry already sealed");

        entries[contentHash] = SealedEntry({
            timestamp: block.timestamp,
            contentHash: contentHash,
            wordCount: wordCount,
            mood: mood
        });

        userEntries[fid].push(contentHash);

        emit EntrySealed(fid, contentHash, block.timestamp, wordCount);
    }

    /**
     * @dev Get the number of sealed entries for a user
     * @param fid Farcaster ID of the user
     * @return The number of sealed entries
     */
    function getUserEntryCount(uint256 fid) external view returns (uint256) {
        return userEntries[fid].length;
    }

    /**
     * @dev Get a specific entry hash for a user by index
     * @param fid Farcaster ID of the user
     * @param index Index of the entry
     * @return The content hash at the specified index
     */
    function getUserEntryByIndex(uint256 fid, uint256 index)
        external
        view
        returns (bytes32)
    {
        require(index < userEntries[fid].length, "Index out of bounds");
        return userEntries[fid][index];
    }

    /**
     * @dev Verify if an entry exists and get its timestamp
     * @param contentHash The content hash to verify
     * @return exists Whether the entry exists
     * @return timestamp When the entry was sealed (0 if doesn't exist)
     */
    function verifyEntry(bytes32 contentHash)
        external
        view
        returns (bool exists, uint256 timestamp)
    {
        SealedEntry memory entry = entries[contentHash];
        exists = entry.timestamp > 0;
        timestamp = entry.timestamp;
    }

    /**
     * @dev Get all entry hashes for a user
     * @param fid Farcaster ID of the user
     * @return Array of content hashes
     */
    function getUserEntries(uint256 fid)
        external
        view
        returns (bytes32[] memory)
    {
        return userEntries[fid];
    }

    /**
     * @dev Get full entry details
     * @param contentHash The content hash
     * @return Entry details (timestamp, wordCount, mood)
     */
    function getEntry(bytes32 contentHash)
        external
        view
        returns (
            uint256 timestamp,
            uint16 wordCount,
            string memory mood
        )
    {
        SealedEntry memory entry = entries[contentHash];
        require(entry.timestamp > 0, "Entry does not exist");
        return (entry.timestamp, entry.wordCount, entry.mood);
    }
}
