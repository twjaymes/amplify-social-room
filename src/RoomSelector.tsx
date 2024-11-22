import { Schema } from "../amplify/data/resource"; // Import the schema definition
import { defaultRoom } from "./utils"; // Import the default room object
import { useEffect, useState } from "react"; // Import React hooks
import { generateClient } from "aws-amplify/data"; // Import the client generation utility

// Initialize the Amplify client with the schema type
const client = generateClient<Schema>();

export function RoomSelector({
  currentRoomId, // ID of the currently selected room
  onRoomChange, // Callback to handle room changes
}: {
  currentRoomId: string; // Current room ID must be a string
  onRoomChange: (roomId: string) => void; // Function to handle room ID changes
}) {
  // State to store the list of rooms, initialized with a default room
  const [rooms, setRooms] = useState<Schema["Room"]["type"][]>([defaultRoom]);

  useEffect(() => {
    // Set up a live feed to observe room changes
    const sub = client.models.Room.observeQuery().subscribe({
      next: (data) => {
        // Update the room list with the default room and new data
        setRooms([defaultRoom, ...data.items]);
      },
    });

    // Cleanup the subscription when the component unmounts
    return () => sub.unsubscribe();
  }, []); // Empty dependency array ensures this runs only once after mounting

  return (
    <>
      {/* Accessible label for the room selector */}
      <label htmlFor="room-selector">Select a room</label>

      {/* Dropdown to select a room */}
      <select
        id="room-selector" // Associates with the label for accessibility
        onChange={(e) => onRoomChange(e.target.value)} // Trigger onRoomChange when selection changes
        value={currentRoomId} // Set the current value of the dropdown
      >
        {rooms.map((room) => (
          <option value={room.id} key={room.id}>
            {room.topic} {/* Display room topic */}
          </option>
        ))}
      </select>

      {/* Button to add a new room */}
      <button
        onClick={async () => {
          // Prompt the user for a new room name
          const newRoomName = window.prompt("Room name");
          if (!newRoomName) {
            return; // Exit if the user cancels the prompt
          }

          // Create a new room using the client
          const room = await client.models.Room.create({
            topic: newRoomName,
          });

          // Update the selected room if the creation was successful
          if (room !== null && "id" in room) {
            onRoomChange((room as { id: string }).id);
          }
        }}
      >
        [+ add] {/* Button text */}
      </button>
    </>
  );
}