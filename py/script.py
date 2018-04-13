import sys

# numRecent: The number of recent user messages, which are the number of messages since the last time the Empathy bot responded
numRecent = int( sys.argv[1] )
# An array of scores, for each user message
scoreArray = sys.argv[2].split(',')
# An array of average scores, for each user message
comparativeScoreArray = sys.argv[3].split(',')

# The following are an array of words, key words, positive words, and negative words from the User's message
    # Some words are Three colons ":::"
    # Three colons are used to indicate the end of a User's message
wordsArray = sys.argv[4].split(',')
keyWordsArray = sys.argv[5].split(',')
positiveArray = sys.argv[6].split(',')
negativeArray = sys.argv[7].split(',')

sumScore = 0
for i in range( len( scoreArray ) - numRecent, len( scoreArray ) ):
    sumScore += float( scoreArray[i] )
avgScore = sumScore / len( scoreArray )

sumComparativeScore = 0
for i in range( len( comparativeScoreArray ) - numRecent, len( comparativeScoreArray ) ):
    sumComparativeScore += float( comparativeScoreArray[i] )
avgComparativeScore = sumComparativeScore / len( comparativeScoreArray )
    
response = ''
response += 'Total Score: ' + str( sumScore ) + ', '
response += 'Avg Score: ' + str( avgScore ) + ', '
response += 'Total Comparative Score: ' + str( sumComparativeScore ) + ', '
response += 'Avg Comparative Score: ' + str( avgComparativeScore ) + ', '
response += 'Recent Words: '

# Get the most recent messages, and not all messages
recentWordsArray = []
recentCount = 0
for i in reversed( wordsArray ):
    if( i == ':::' ):
        recentCount += 1
        recentWordsArray.append( i )
    elif( recentCount <= numRecent ):
        recentWordsArray.append( i )
    else:
        break
recentWordsArray.reverse()

for word in recentWordsArray:
    response += word + ' '

print( response )
