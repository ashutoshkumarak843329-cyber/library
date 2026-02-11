document.addEventListener('DOMContentLoaded', () => {
    const memberForm = document.getElementById("memberForm");
    const memberTableBody = document.getElementById("memberTableBody");

    // Load members from server
    async function loadMembers() {
        const res = await fetch("http://localhost:3000/members");
        const members = await res.json();

        memberTableBody.innerHTML = "";
        members.forEach((member) => {
            addMemberRow(member.name, member.id, member.department);
        });
    }

    // Add member row to table
    function addMemberRow(name, id, department) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${name}</td>
            <td>${id}</td>
            <td>${department}</td>
            <td><button onclick="deleteMember('${id}')">🗑️ Remove</button></td>
        `;
        memberTableBody.appendChild(row);
    }

    // Add member to server
    memberForm.addEventListener("submit", async(e) => {
        e.preventDefault();

        const name = document.getElementById("memberName").value.trim();
        const id = document.getElementById("memberId").value.trim();
        const department = document.getElementById("department").value.trim();

        if (!name || !id || !department) {
            alert("Please fill all fields");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, id, department }),
            });

            if (res.ok) {
                addMemberRow(name, id, department);
                memberForm.reset();
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error adding member:', error);
            alert('Failed to add member. Please check console for details.');
        }
    });

    // Delete member
    async function deleteMember(memberId) {
        await fetch(`http://localhost:3000/members/${memberId}`, {
            method: "DELETE",
        });
        loadMembers();
    }

    // Initial Load
    loadMembers();
});