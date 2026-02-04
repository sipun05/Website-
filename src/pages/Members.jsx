import React, { useEffect, useState } from "react";
import { Search, User, Calendar, Briefcase, Hash, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Members() {
  const [memberId, setMemberId] = useState("");
  const [memberData, setMemberData] = useState(null);
  const [error, setError] = useState("");

  // State for storing the full member database
  const [membersDatabase, setMembersDatabase] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Fetch encrypted data to hide contents from network tab
        const response = await fetch("/Members/members_data.enc");
        const encryptedText = await response.text();

        // Decrypt data
        const SECRET_KEY = "VJDQ_Secret_Key_24_28";
        let decryptedText = "";
        for (let i = 0; i < encryptedText.length; i += 2) {
          const hex = encryptedText.substr(i, 2);
          const charCode = parseInt(hex, 16);
          const keyChar = SECRET_KEY.charCodeAt((i / 2) % SECRET_KEY.length);
          decryptedText += String.fromCharCode(charCode ^ keyChar);
        }

        const text = decryptedText;

        // Parse CSV
        const lines = text.split("\n");
        // Headers are: SNO,Name,Roll Number,DS,Section,DQ IDS FF,DOMAIN ASSIGNED,WHATSAPP LINK

        const db = {};

        // Start from index 1 to skip header
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          // Handle potential commas in fields by using a regex or simple split if simple CSV
          // The file seems to be simple CSV.
          const values = lines[i].split(",");

          if (values.length >= 7) {
            const name = values[1].trim();
            const id = values[5].trim().toUpperCase();
            // Batch is not in CSV, assuming 2028 based on filename/context
            const batch = "2028";
            const domain = values[6].trim();
            const whatsappLink = values[7] ? values[7].trim() : "";

            if (id) {
              db[id] = { name, batch, domain, id, whatsappLink };
            }
          }
        }

        setMembersDatabase(db);
        setLoading(false);
      } catch (err) {
        console.error("Error loading members data:", err);
        setError("Failed to load member database.");
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleSearch = () => {
    setError("");
    setMemberData(null);

    if (!memberId.trim()) {
      setError("Please enter a Member ID");
      return;
    }

    const member = membersDatabase[memberId.toUpperCase()];

    if (member) {
      setMemberData(member);
    } else {
      // Check if ID is in the range VJDQ2K25001 to VJDQ2K25148
      const idPattern = /^VJDQ2K25(\d{3})$/i;
      const match = memberId.match(idPattern);

      let showDomainError = false;
      if (match) {
        const number = parseInt(match[1], 10);
        if (number >= 1 && number <= 148) {
          showDomainError = true;
        }
      }

      if (showDomainError) {
        setError("You haven't opted for domain division. Please contact the following Team Relation Representatives.");
      } else {
        setError("Member ID not found. Please check and try again.");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen w-full py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0f323f] mb-4 font-[Bricolage Grotesque]">
            Member Lookup
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            View member details
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full flex-1">
              <label
                htmlFor="memberId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Member ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="memberId"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., VJDQ2K25999"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f323f] focus:border-transparent transition-all"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="w-full md:w-auto px-8 py-3 bg-[#0f323f] text-white font-medium rounded-lg hover:bg-[#135168] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#0f323f]"
            >
              Search
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className={`mt-4 p-4 rounded-xl border ${error.includes("domain division")
                ? "bg-blue-50 border-blue-100"
                : "bg-red-50 border-red-100 text-red-700"
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {error.includes("domain division") ? "⚠️" : "⚠️"}
                </span>
                <p className={`font-medium ${error.includes("domain division") ? "text-blue-800" : "text-red-700"}`}>
                  {error}
                </p>
              </div>

              {error.includes("domain division") && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 1, name: "Srishanth", image: "/teamImages/Srishanth-2027.png", phone: "918919776534" },
                    { id: 2, name: "Sahasra", image: "/teamImages/Sahasra-2027.png", phone: "919346477090" },
                    { id: 3, name: "Shashank", image: "/teamImages/Shashank-2027.png", phone: "918639950475" }
                  ].map((rep) => (
                    <div key={rep.id} className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mb-3 overflow-hidden">
                        <img
                          src={rep.image}
                          alt={rep.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900">{rep.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">TRR</p>
                      <a
                        href={`https://wa.me/${rep.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white font-medium bg-green-500 px-3 py-1 rounded-full hover:bg-green-600 transition-colors"
                      >
                        Contact via WhatsApp
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Member Details Display */}
        {memberData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="bg-[#0f323f] px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-full">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {memberData.name}
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                    Active Member
                  </span>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-white/60 text-sm uppercase tracking-wide">
                  Member ID
                </p>
                <p className="text-white font-mono text-xl">{memberData.id}</p>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-[#f8f9fa] border border-gray-100">
                  <div className="flex items-center gap-3 mb-2 text-gray-500">
                    <Hash className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wide">
                      ID
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 font-mono">
                    {memberData.id}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#f8f9fa] border border-gray-100">
                  <div className="flex items-center gap-3 mb-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wide">
                      Batch
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {memberData.batch}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#f8f9fa] border border-gray-100">
                  <div className="flex items-center gap-3 mb-2 text-gray-500">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wide">
                      Domain
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {memberData.domain}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#128C7E] transition-colors shadow-sm"
                  onClick={() => {
                    if (memberData.whatsappLink) {
                      window.open(memberData.whatsappLink, "_blank");
                    } else {
                      alert("WhatsApp link not available for this member.");
                    }
                  }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Join WhatsApp Group
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div >
  );
}
